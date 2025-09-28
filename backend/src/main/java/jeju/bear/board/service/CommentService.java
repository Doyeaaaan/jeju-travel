package jeju.bear.board.service;

import jeju.bear.user.entity.User;

public interface CommentService {

    void createComment(Long postId, User user, String content);

    void updateComment(Long commentId, User user, String content);

    void deleteComment(Long commentId, User user);
}

