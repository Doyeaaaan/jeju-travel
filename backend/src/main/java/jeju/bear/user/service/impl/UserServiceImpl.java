package jeju.bear.user.service.impl;

import jeju.bear.auth.repository.RefreshTokenRepository;
import jeju.bear.auth.repository.EmailVerificationRepository;
import jeju.bear.board.dto.CommentResponseDto;
import jeju.bear.global.common.CustomException;
import jeju.bear.global.common.ErrorCode;
import jeju.bear.global.s3.S3Service;
import jeju.bear.place.dto.FavoriteDto;
import jeju.bear.place.entity.Favorite;
import jeju.bear.user.dto.FriendResponseDto;
import jeju.bear.user.dto.MypagePostDto;
import jeju.bear.user.dto.MypageResponseDto;
import jeju.bear.user.dto.ProfileUpdateDto;
import jeju.bear.user.entity.User;
import jeju.bear.user.repository.UserRepository;
import jeju.bear.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final EmailVerificationRepository emailVerificationRepository;
    private final S3Service s3Service;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public MypageResponseDto getMyPage(Long userId) {
        System.out.println("🔍 마이페이지 요청 - 사용자 ID: " + userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        
        System.out.println("👤 사용자 정보: " + user.getNickname() + " (" + user.getEmail() + ")");
        
        // 사용자의 게시글과 댓글 목록을 가져옴
        List<MypagePostDto> posts = user.getPosts().stream()
                .map(MypagePostDto::new)
                .collect(Collectors.toList());
        
        System.out.println("📝 게시글 개수: " + posts.size());
        
        List<CommentResponseDto> comments = user.getComments().stream()
                .map(comment -> new CommentResponseDto(comment, user))
                .collect(Collectors.toList());
        
        System.out.println("💬 댓글 개수: " + comments.size());
        
        List<FavoriteDto> favorites = user.getFavorites().stream()
                .map(FavoriteDto::from)
                .collect(Collectors.toList());
        
        System.out.println("❤️ 즐겨찾기 개수: " + favorites.size());
        
        // 친구 목록은 현재 구현되지 않으므로 빈 리스트로 설정
        List<FriendResponseDto> friends = new ArrayList<>();
        
        System.out.println("👥 친구 개수: " + friends.size());
        
        MypageResponseDto response = MypageResponseDto.builder()
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .posts(posts)
                .comments(comments)
                .favorites(favorites)
                .friends(friends)
                .build();
        
        System.out.println("✅ 마이페이지 응답 생성 완료");
        return response;
    }

    @Override
    public void updateProfile(Long userId, ProfileUpdateDto dto, MultipartFile image) {
        System.out.println("🔧 프로필 업데이트 시작 - 사용자 ID: " + userId);
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        System.out.println("👤 기존 사용자 정보: " + user.getNickname() + " (" + user.getEmail() + ")");

        if (dto != null) {
            System.out.println("📝 DTO 정보: " + dto.getNickname() + ", 비밀번호 변경: " + (dto.getPassword() != null));
            
            if (dto.getNickname() != null && !dto.getNickname().equals(user.getNickname())) {
                System.out.println("🔄 닉네임 변경: " + user.getNickname() + " → " + dto.getNickname());
                
                if (userRepository.existsByNickname(dto.getNickname())) {
                    throw new CustomException(ErrorCode.DUPLICATE_NICKNAME);
                }
                user.updateNickname(dto.getNickname());
            }

            if (dto.getPassword() != null) {
                if (user.getProvider() != null) {
                    throw new CustomException(ErrorCode.OAUTH2_USER_PASSWORD_UPDATE_DENIED);
                }
                System.out.println("🔐 비밀번호 변경 요청");
                // 비밀번호 암호화 로직 필요
                user.updatePassword(dto.getPassword());
            }
        }

        if (image != null && !image.isEmpty()) {
            System.out.println("📸 이미지 업로드 시작: " + image.getOriginalFilename() + " (" + image.getSize() + " bytes)");
            
            // 기존 이미지가 있다면 S3에서 삭제
            if (user.getProfileImage() != null) {
                System.out.println("🗑️ 기존 이미지 삭제: " + user.getProfileImage());
                s3Service.deleteFile(user.getProfileImage());
            }
            
            String imageUrl = s3Service.uploadFile(image);
            System.out.println("✅ 새 이미지 업로드 완료: " + imageUrl);
            user.updateProfileImage(imageUrl);
        } else {
            System.out.println("📸 이미지 업로드 없음");
        }
        
        System.out.println("✅ 프로필 업데이트 완료");
    }

    @Override
    public void deleteById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // 리프레시 토큰 삭제
        refreshTokenRepository.deleteAllByUserId(userId);

        // 이메일 인증 코드 삭제
        emailVerificationRepository.deleteAllByEmail(user.getEmail());

        // S3에서 프로필 이미지 삭제
        if (user.getProfileImage() != null) {
            s3Service.deleteFile(user.getProfileImage());
        }

        // S3에서 게시글 이미지들 삭제
        for (jeju.bear.board.entity.Post post : user.getPosts()) {
            for (jeju.bear.board.entity.Image image : post.getImages()) {
                s3Service.deleteFile(image.getUrl());
            }
        }

        // 연관된 엔티티들은 cascade = CascadeType.ALL과 orphanRemoval = true로 인해 자동 삭제됨
        // - 게시글 (Post)
        // - 댓글 (Comment)
        // - 즐겨찾기 (Favorite)
        // - 여행 계획 (TripPlan)
        // - 게시글 좋아요 (PostLike)
        // - 친구 관계 (Friend)
        userRepository.delete(user);
    }

    @Override
    @Transactional(readOnly = true)
    public User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    @Override
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        // OAuth2 계정인지 확인
        if (user.getProvider() != null) {
            throw new CustomException(ErrorCode.OAUTH2_USER_PASSWORD_UPDATE_DENIED);
        }

        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new CustomException(ErrorCode.INVALID_PASSWORD);
        }

        // 새 비밀번호 암호화하여 저장
        user.updatePassword(passwordEncoder.encode(newPassword));
    }
} 