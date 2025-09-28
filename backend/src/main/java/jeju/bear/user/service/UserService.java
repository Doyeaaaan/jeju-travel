package jeju.bear.user.service;

import jeju.bear.user.dto.MypageResponseDto;
import jeju.bear.user.dto.ProfileUpdateDto;
import jeju.bear.user.entity.User;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {

    MypageResponseDto getMyPage(Long userId);

    void updateProfile(Long userId, ProfileUpdateDto dto, MultipartFile image);

    void deleteById(Long id);

    // 이메일로 사용자 찾기
    User findUserByEmail(String email);

    // 비밀번호 변경
    void changePassword(Long userId, String currentPassword, String newPassword);

}
