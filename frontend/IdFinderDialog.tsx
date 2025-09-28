"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function IdFinderDialog({ open, onClose }: Props) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [foundEmail, setFoundEmail] = useState("");
  const [notFound, setNotFound] = useState(false);

  const handleFind = () => {
    const stored = localStorage.getItem("users");
    if (!stored) {
      setFoundEmail("");
      setNotFound(true);
      return;
    }

    const users = JSON.parse(stored);
    const inputDate = `${year}-${month}-${day}`;

    const matchedUser = users.find((user: any) => {
      const savedDate = `${user.birthYear}-${user.birthMonth}-${user.birthDay}`;
      return user.name === name && savedDate === inputDate;
    });

    if (matchedUser) {
      const masked = matchedUser.email.replace(/(.{3}).*(@.*)/, "$1***$2");
      setFoundEmail(masked);
      setNotFound(false);
    } else {
      setFoundEmail("");
      setNotFound(true);
    }
  };

  const handleReset = () => {
    setName("");
    setYear("");
    setMonth("");
    setDay("");
    setFoundEmail("");
    setNotFound(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>아이디 찾기</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-gray-500">
          가입 시 입력한 이름과 생년월일을 입력해주세요.
        </p>
        <Label>이름</Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="홍길동"
        />

        <Label>생년월일</Label>
        <div className="flex gap-2">
          <Input
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="년"
            className="w-1/3"
          />
          <Input
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="월"
            className="w-1/3"
          />
          <Input
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="일"
            className="w-1/3"
          />
        </div>

        {foundEmail && (
          <div className="p-4 bg-gray-50 rounded-md mt-2 text-center font-medium">
            회원님의 이메일: {foundEmail}
          </div>
        )}

        {notFound && (
          <div className="text-sm text-red-600 mt-2">
            입력한 정보와 일치하는 계정을 찾을 수 없습니다.
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={handleReset}>
            닫기
          </Button>
          {!foundEmail && !notFound ? (
            <Button onClick={handleFind}>아이디 찾기</Button>
          ) : (
            <Button onClick={handleReset}>확인</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
