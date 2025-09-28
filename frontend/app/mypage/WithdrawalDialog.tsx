"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { userService } from "@/lib/user-service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface WithdrawalDialogProps {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onSuccess: () => void;
}

export default function WithdrawalDialog({
  open,
  onOpenChange,
  onSuccess,
}: WithdrawalDialogProps) {
  const [withdrawalStep, setWithdrawalStep] = useState<
    "reason" | "confirm" | "password"
  >("reason");
  const [withdrawalReason, setWithdrawalReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [password, setPassword] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const withdrawalReasons = [
    "서비스 이용이 불편해요",
    "다른 서비스를 이용하고 있어요",
    "개인정보 보호를 위해 탈퇴할게요",
    "콘텐츠가 부족해요",
    "자주 사용하지 않아요",
    "기타",
  ];

  const handleWithdrawalSubmit = () => {
    onOpenChange(false);
    setIsConfirmOpen(true);
  };

  const handleFinalWithdrawal = async () => {
    try {
      
      // 백엔드 API 호출
      const response = await userService.deleteAccount();
      
      // 백엔드 응답 형식: { status: "200 OK", message: "...", data: null }
      if (response.status === "200 OK" || response.status === "success") {
        
        // 로컬 스토리지 정리
        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        
        toast.success("정상적으로 탈퇴되었습니다.");
        onSuccess();
      } else {
        throw new Error(response.message || "탈퇴 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "탈퇴 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger asChild>
          <Button variant="destructive" size="sm">
            탈퇴하기
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>회원탈퇴</DialogTitle>
            <DialogDescription>
              {withdrawalStep === "reason" &&
                "탈퇴 이유를 알려주시면 서비스 개선에 도움이 됩니다."}
              {withdrawalStep === "confirm" &&
                "탈퇴 시 아래 정보가 모두 삭제됩니다."}
              {withdrawalStep === "password" &&
                "보안을 위해 비밀번호를 입력해주세요."}
            </DialogDescription>
          </DialogHeader>

          {withdrawalStep === "reason" && (
            <div className="py-4">
              <div className="space-y-2">
                {withdrawalReasons.map((reason) => (
                  <div key={reason} className="flex items-center">
                    <input
                      type="radio"
                      id={`reason-${reason}`}
                      name="withdrawal-reason"
                      value={reason}
                      checked={withdrawalReason === reason}
                      onChange={() => setWithdrawalReason(reason)}
                      className="mr-2"
                    />
                    <label htmlFor={`reason-${reason}`} className="text-sm">
                      {reason}
                    </label>
                  </div>
                ))}
              </div>

              {withdrawalReason === "기타" && (
                <div className="mt-4">
                  <Label htmlFor="other-reason">기타 이유</Label>
                  <Input
                    id="other-reason"
                    value={otherReason}
                    onChange={(e) => setOtherReason(e.target.value)}
                    placeholder="탈퇴 이유를 입력해주세요"
                    className="mt-1"
                  />
                </div>
              )}

              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  취소
                </Button>
                <Button
                  onClick={() => setWithdrawalStep("confirm")}
                  disabled={!withdrawalReason}
                >
                  다음
                </Button>
              </DialogFooter>
            </div>
          )}

          {withdrawalStep === "confirm" && (
            <div className="py-4">
              <div className="bg-gray-50 p-4 rounded-md mb-4">
                <h4 className="font-medium mb-2">탈퇴 시 삭제되는 정보</h4>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li>• 계정 정보 (이메일, 닉네임, 프로필 사진 등)</li>
                  <li>• 작성한 리뷰 및 댓글</li>
                  <li>• 저장한 여행 일정</li>
                  <li>• 친구 목록</li>
                  <li>• 좋아요 표시한 장소</li>
                </ul>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setWithdrawalStep("reason")}
                >
                  이전
                </Button>
                <Button
                  onClick={() => setWithdrawalStep("password")}
                  variant="destructive"
                >
                  계속하기
                </Button>
              </DialogFooter>
            </div>
          )}

          {withdrawalStep === "password" && (
            <div className="py-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="password">비밀번호</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="confirm-withdrawal"
                    className="mr-2"
                  />
                  <label htmlFor="confirm-withdrawal" className="text-sm">
                    모든 정보가 삭제되는 것을 이해했으며, 탈퇴에 동의합니다.
                  </label>
                </div>
              </div>

              <DialogFooter className="mt-6">
                <Button
                  variant="outline"
                  onClick={() => setWithdrawalStep("confirm")}
                >
                  이전
                </Button>
                <Button
                  onClick={handleWithdrawalSubmit}
                  variant="destructive"
                  disabled={!password}
                >
                  탈퇴하기
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 최종 확인창 */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalWithdrawal}
              className="bg-red-600 hover:bg-red-700"
            >
              탈퇴하기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
