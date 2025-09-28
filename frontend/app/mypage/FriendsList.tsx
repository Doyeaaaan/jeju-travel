"use client";
import Image from "next/image";
import Link from "next/link";

interface Friend {
  id: string;
  name: string;
  image?: string;
}

interface FriendsListProps {
  friends: Friend[];
}

export default function FriendsList({ friends }: FriendsListProps) {
  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">친구</h2>
        <Link href="/friends" className="text-sm text-gray-500 hover:underline">
          모든 친구 보기
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {friends.slice(0, 8).map((friend) => (
          <div key={friend.id} className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden relative mb-2">
              {friend.image && (
                <Image
                  src={friend.image}
                  alt={friend.name}
                  fill
                  className="object-cover"
                />
              )}
            </div>
            <span className="text-xs font-medium text-center">
              {friend.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
