import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../../lib/auth-service';
import { Button, TextField, Box, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const Input = styled('input')({
  display: 'none',
});

interface LocationState {
  code: string;
  email: string;
  provider: string;
}

const OAuth2SignupForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { code, email, provider } = location.state as LocationState;
  
  const [nickname, setNickname] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError('닉네임을 입력해주세요.');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('dto', new Blob([JSON.stringify({
        code,
        email,
        nickname
      })], { type: 'application/json' }));
      
      if (profileImage) {
        formData.append('image', profileImage);
      }

      const response = await authService.oauth2Join(formData, provider);
      
      // 토큰 저장
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // 메인 페이지로 이동
      navigate('/');
    } catch (error: any) {
      if (error.response?.status === 409) {
        setError('이미 사용 중인 닉네임입니다.');
      } else {
        setError('회원가입 중 오류가 발생했습니다.');
      }
    }
  };

  return (
    <Box
      sx={{
        marginTop: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: 400,
        mx: 'auto',
        p: 2,
      }}
    >
      <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
        추가 정보 입력
      </Typography>

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar
            src={previewUrl || undefined}
            sx={{ width: 100, height: 100, mb: 2 }}
          />
          <label htmlFor="profile-image">
            <Input
              accept="image/*"
              id="profile-image"
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <Button variant="outlined" component="span">
              프로필 이미지 선택
            </Button>
          </label>
        </Box>

        <TextField
          margin="normal"
          required
          fullWidth
          label="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          error={!!error}
          helperText={error}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          가입하기
        </Button>
      </Box>
    </Box>
  );
};

export default OAuth2SignupForm;
