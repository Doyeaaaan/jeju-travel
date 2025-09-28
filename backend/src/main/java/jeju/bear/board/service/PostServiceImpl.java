package jeju.bear.board.service;

import jeju.bear.board.dto.PageResponseDto;
import jeju.bear.board.dto.PostDetailResponseDto;
import jeju.bear.board.dto.PostRequestDto;
import jeju.bear.board.dto.PostUpdateDto;
import jeju.bear.board.entity.Image;
import jeju.bear.board.entity.Post;
import jeju.bear.board.entity.PostLike;
import jeju.bear.board.repository.ImageRepository;
import jeju.bear.board.repository.PostLikeRepository;
import jeju.bear.board.repository.PostRepository;
import jeju.bear.global.common.CustomException;
import jeju.bear.global.common.ErrorCode;
import jeju.bear.global.s3.S3Service;
import jeju.bear.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Slf4j
@RequiredArgsConstructor
@Service
public class PostServiceImpl implements PostService {

    private final int PAGE_SIZE = 50;

    private final PostRepository postRepository;
    private final PostLikeRepository postLikeRepository;
    private final ImageRepository imageRepository;
    private final S3Service s3Service;

    @Override
    public void save(PostRequestDto dto, User user, List<MultipartFile> files) {

        // 일정 관련 로직 추가하기
        Post post = Post.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .user(user)
                .tripPlan(null)
                .images(null)
                .build();

        postRepository.save(post);

        // 이미지 업로드
        uploadImages(files, post);
    }

    @Override
    public PageResponseDto findAllByPage(int page, String keyword) {
        if(page < 0) {
            throw new CustomException(ErrorCode.BAD_REQUEST, "page는 0 이상이어야 합니다.");
        }

        Pageable pageable = PageRequest.of(page, PAGE_SIZE, Sort.by("createdAt").descending());
        Page<Post> postPage;

        if(keyword == null) {
            postPage = postRepository.findAll(pageable);
        } else {
            postPage = postRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(keyword, keyword, pageable);
        }
        return new PageResponseDto(postPage, page);
    }

    @Transactional
    @Override
    public PostDetailResponseDto findById(Long id, User user) {
        Optional<Post> postOptional = postRepository.findById(id);
        if(postOptional.isEmpty()) {
            throw new CustomException(ErrorCode.NOT_FOUND);
        }

        Post post = postOptional.get();
        boolean isWriter = false;
        boolean isLiked = false;
        if(user != null) {
            isWriter = post.getUser().getId().equals(user.getId());

            for(PostLike like : post.getPostLikes()) {
                if(like.getUser().getId().equals(user.getId())) {
                    isLiked = true;
                    break;
                }
            }
        }
        postRepository.incrementViews(id);

        return new PostDetailResponseDto(postOptional.get(), isWriter, isLiked, user);
    }

    // 일정 관련 로직 추가할 것
    @Override
    public void update(Long id, PostUpdateDto dto, User user, List<MultipartFile> files) {
        Optional<Post> postOptional = postRepository.findById(id);
        if(postOptional.isEmpty()) {
            throw new CustomException(ErrorCode.NOT_FOUND);
        }

        Post post = postOptional.get();
        if(!post.getUser().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN, "수정 권한이 없습니다.");
        }

        post.updateTitle(dto.getTitle());
        post.updateContent(dto.getContent());
        //post.updatePlan(null);

        postRepository.save(post);

        // 이미지 삭제
        List<Long> deleteImages = dto.getDeleteImages();
        if(deleteImages != null && !deleteImages.isEmpty()) {
            for(Long imageId : deleteImages) {
                Optional<Image> imageOptional = imageRepository.findById(imageId);
                if(imageOptional.isPresent()) {
                    Image image = imageOptional.get();
                    // imageService.deleteImage(image.getUrl());
                    imageRepository.delete(image);
                }
            }
        }

        // 이미지 업로드
        uploadImages(files, post);
    }

    @Override
    public void delete(Long id, User user) {
        Optional<Post> postOptional = postRepository.findById(id);
        if(postOptional.isEmpty()) {
            throw new CustomException(ErrorCode.NOT_FOUND);
        }

        Post post = postOptional.get();
        if(!post.getUser().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN, "삭제 권한이 없습니다.");
        }

        // 이미지 삭제
        for(Image image : post.getImages()) {
            // imageService.deleteImage(image.getUrl());
        }

        postRepository.delete(post);
    }

    @Override
    public void like(Long id, User user) {
        Optional<Post> postOptional = postRepository.findById(id);
        if(postOptional.isEmpty()) {
            throw new CustomException(ErrorCode.NOT_FOUND);
        }

        Post post = postOptional.get();
        List<PostLike> likes = post.getPostLikes();
        for(PostLike like : likes) {
            if(like.getUser().getId().equals(user.getId())) {
                return;
            }
        }

        postLikeRepository.save(new PostLike(post, user));
    }

    @Transactional
    @Override
    public void deleteLike(Long id, User user) {
        Optional<Post> postOptional = postRepository.findById(id);
        if(postOptional.isEmpty()) {
            throw new CustomException(ErrorCode.NOT_FOUND);
        }

        Post post = postOptional.get();
        List<PostLike> likes = post.getPostLikes();
        for(PostLike like : likes) {
            if(like.getUser().getId().equals(user.getId())) {
                post.getPostLikes().remove(like);
                return;
            }
        }
    }

    private void uploadImages(List<MultipartFile> files, Post post) {
        if(files != null && !files.isEmpty()) {
            for(MultipartFile file : files) {
                // S3에 게시글 이미지 업로드 (post-images 폴더에 저장)
                String url = s3Service.uploadFile(file, "post-images");
                if(url == null || url.startsWith("temp-file-url-")) {
                    throw new CustomException(ErrorCode.INTERNAL_SERVER_ERROR, "게시글 이미지 업로드 오류");
                }
                Image image = Image.builder()
                        .post(post)
                        .url(url)
                        .build();
                imageRepository.save(image);
            }
        }
    }
}
