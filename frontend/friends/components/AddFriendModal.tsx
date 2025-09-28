"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Search, UserPlus } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { friendService } from "@/lib/friend-service";

interface SearchResult {
  id: number;
  nickname: string;
  email: string;
  profileImage?: string;
}

interface AddFriendModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddFriendModal({
  open,
  onClose,
  onSuccess,
}: AddFriendModalProps) {
  const [friendEmail, setFriendEmail] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSendingRequest, setIsSendingRequest] = useState(false);

  const handleSearch = async () => {
    if (!friendEmail.trim()) return;

    setIsSearching(true);
    try {
      // 이메일로 사용자 검색 (백엔드 API 필요)
      // const results = await friendService.searchUserByEmail(friendEmail);
      // setSearchResults(results);
      
      // 임시로 검색 결과를 시뮬레이션
      setSearchResults([]);
    } catch (error) {
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (email: string) => {
    setIsSendingRequest(true);
    try {
      const result = await friendService.addFriend(email);
      if (result.success) {
        alert("친구 요청을 보냈습니다!");
        setFriendEmail("");
        onSuccess?.();
        onClose();
      } else {
        alert(result.message || "친구 요청 전송에 실패했습니다.");
        // 409 에러나 이미 친구인 경우 모달 닫기
        if (result.message?.includes("이미")) {
          setFriendEmail("");
          onSuccess?.();
          onClose();
        }
      }
    } catch (error) {
      alert("친구 요청 전송에 실패했습니다.");
    } finally {
      setIsSendingRequest(false);
    }
  };

  const handleSendInviteEmail = () => {
    if (friendEmail) {
      alert(`${friendEmail}님에게 초대 이메일을 보냈습니다.`);
      setFriendEmail("");
      onClose();
    } else {
      alert("이메일 주소를 입력해주세요.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>친구 추가하기</DialogTitle>
          <DialogDescription>
            이메일 주소로 친구를 검색하고 친구 요청을 보내세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일 주소</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="friend@example.com"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleSearch}
                disabled={!friendEmail.trim() || isSearching}
              >
                {isSearching ? "검색 중..." : "검색"}
              </Button>
            </div>
          </div>

          {isSearching && (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black" />
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">검색 결과</h3>
              {searchResults.map((result) => (
                <div
                  key={result.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                      <Image
                        src={result.profileImage || "/placeholder.svg"}
                        alt={result.nickname}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{result.nickname}</p>
                      <p className="text-sm text-gray-500">{result.email}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="rounded-full bg-black hover:bg-gray-800 text-white"
                    onClick={() => handleSendRequest(result.email)}
                    disabled={isSendingRequest}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    친구 요청
                  </Button>
                </div>
              ))}
            </div>
          )}

          {!isSearching && friendEmail && searchResults.length === 0 && (
            <div className="text-center py-4">
              <Search className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">검색 결과가 없습니다.</p>
              <p className="text-sm text-gray-500 mt-1">
                이메일 주소를 다시 확인해주세요.
              </p>
            </div>
          )}

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium">이메일로 초대하기</h4>
                <p className="text-xs text-gray-500 mt-1">
                  아직 가입하지 않은 친구에게 초대 이메일을 보낼 수 있습니다.
                </p>
                <Button
                  variant="link"
                  className="text-black p-0 h-auto text-xs mt-2"
                  onClick={handleSendInviteEmail}
                >
                  초대 이메일 보내기
                </Button>
              </div>
            </div>
          </div>

          {friendEmail && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-blue-900">직접 친구 요청 보내기</h4>
                  <p className="text-xs text-blue-700 mt-1">
                    {friendEmail}님에게 직접 친구 요청을 보낼 수 있습니다.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => handleSendRequest(friendEmail)}
                  disabled={isSendingRequest}
                >
                  {isSendingRequest ? "전송 중..." : "친구 요청"}
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="rounded-full">
            취소
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
