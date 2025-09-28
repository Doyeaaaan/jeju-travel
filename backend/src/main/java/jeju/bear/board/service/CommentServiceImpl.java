package jeju.bear.board.service;

import jeju.bear.board.entity.Comment;
import jeju.bear.board.entity.Post;
import jeju.bear.board.repository.CommentRepository;
import jeju.bear.board.repository.PostRepository;
import jeju.bear.global.common.CustomException;
import jeju.bear.global.common.ErrorCode;
import jeju.bear.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@RequiredArgsConstructor
@Service
public class CommentServiceImpl implements CommentService{

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;

    @Override
    public void createComment(Long postId, User user, String content) {
        Optional<Post> postOptional = postRepository.findById(postId);
        if(postOptional.isEmpty()) {
            throw new CustomException(ErrorCode.NOT_FOUND);
        }

        Comment comment = Comment.builder()
                .post(postOptional.get())
                .user(user)
                .content(content)
                .build();
        commentRepository.save(comment);
    }

    @Override
    public void updateComment(Long commentId, User user, String content) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if(commentOptional.isEmpty()) {
            throw new CustomException(ErrorCode.NOT_FOUND);
        }

        Comment comment = commentOptional.get();
        if(!comment.getUser().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN, "수정 권한이 없습니다.");
        }

        commentRepository.save(Comment.builder()
                        .id(commentId)
                        .post(comment.getPost())
                        .user(user)
                        .content(content)
                        .build());
    }

    @Override
    public void deleteComment(Long commentId, User user) {
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if(commentOptional.isEmpty()) {
            throw new CustomException(ErrorCode.NOT_FOUND);
        }

        Comment comment = commentOptional.get();
        if(!comment.getUser().getId().equals(user.getId())) {
            throw new CustomException(ErrorCode.FORBIDDEN, "삭제 권한이 없습니다.");
        }

        commentRepository.delete(comment);
    }

}
