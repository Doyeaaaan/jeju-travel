package jeju.bear.board.service;

import jeju.bear.board.dto.PageResponseDto;
import jeju.bear.board.dto.PostDetailResponseDto;
import jeju.bear.board.dto.PostRequestDto;
import jeju.bear.board.dto.PostUpdateDto;
import jeju.bear.user.entity.User;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PostService {

    void save(PostRequestDto dto, User user, List<MultipartFile> images);

    PageResponseDto findAllByPage(int page, String keyword);

    PostDetailResponseDto findById(Long id, User user);

    void update(Long id, PostUpdateDto dto, User user, List<MultipartFile> images);

    void delete(Long id, User user);

    void like(Long id, User user);

    void deleteLike(Long id, User user);

}
