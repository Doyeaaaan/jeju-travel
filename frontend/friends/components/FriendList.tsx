"use client";

import { Share2, Users, Trash2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { friendService, type Friend } from "@/lib/friend-service";
import { useAuth } from "@/context/AuthContext";

interface FriendListProps {
  onShareClick: (friend: { id: number; name: string }) => void;
  onRefresh?: () => void;
}

export default function FriendList({
  onShareClick,
  onRefresh,
}: FriendListProps) {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const loadFriends = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const friendsData = await friendService.getFriends();
      setFriends(friendsData);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFriend = async (friendId: number) => {
    if (confirm("정말로 이 친구를 삭제하시겠습니까?")) {
      const success = await friendService.deleteFriend(friendId);
      if (success) {
        setFriends(friends.filter(friend => friend.id !== friendId));
        onRefresh?.();
      }
    }
  };

  useEffect(() => {
    loadFriends();
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold">내 친구</h2>
        </div>
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="text-gray-500 mt-2">친구 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold">내 친구</h2>
        <p className="text-sm text-gray-500 mt-1">
          총 {friends.length}명의 친구
        </p>
      </div>

      {friends.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full overflow-hidden mr-4 border border-gray-200">
                      <Image
                        src={friend.profileImage || "/placeholder.svg"}
                        alt={friend.nickname}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    </div>
                    <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{friend.nickname}</p>
                    <p className="text-sm text-gray-500">{friend.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full px-4"
                    onClick={() =>
                      onShareClick({ id: friend.id, name: friend.nickname })
                    }
                  >
                    <Share2 className="h-4 w-4 mr-2" /> 공유하기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full px-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteFriend(friend.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">아직 친구가 없어요</h3>
          <p className="text-gray-500 mb-6 max-w-xs mx-auto">
            친구를 추가하고 함께 여행 계획을 세워보세요!
          </p>
        </div>
      )}
    </div>
  );
}
