'use client';

import { useEffect, useRef, useState } from 'react';

export default function BackgroundPhoto() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // 로그인된 사용자 이메일을 로드하고 배경 이미지 불러오기
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user?.email) {
      setEmail(user.email);
      const savedImage = localStorage.getItem(`backgroundImage-${user.email}`);
      if (savedImage) {
        setBackgroundImage(savedImage);
      }
    }
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 5MB 초과 시 경고 후 종료
      if (file.size > 5 * 1024 * 1024) {
        alert('이미지 용량은 5MB 이하로 업로드해주세요.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Image = reader.result as string;
        setBackgroundImage(base64Image);
        if (email) {
          localStorage.setItem(`backgroundImage-${email}`, base64Image);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      className="relative w-full h-64 rounded-xl shadow-md"
      style={{
        backgroundImage: backgroundImage
          ? `url(${backgroundImage})`
          : 'url(/default-background.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
      <button
        onClick={handleButtonClick}
        className="absolute bottom-4 right-4 bg-black text-white text-sm px-4 py-2 rounded shadow hover:bg-gray-800"
      >
        배경사진 바꾸기
      </button>
    </div>
  );
}
