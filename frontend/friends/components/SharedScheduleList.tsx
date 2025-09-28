"use client";

import { Calendar, Clock, ExternalLink, MapPin, Share2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Friend {
  id: number;
  name: string;
  image?: string;
}

interface SharedSchedule {
  id: number;
  title: string;
  date: string;
  location: string;
  sharedBy: { id: number; name: string; image?: string };
  sharedAt: string;
  status: "pending" | "accepted" | "declined";
}

export default function SharedScheduleList({
  schedules,
  onAction,
}: {
  schedules: SharedSchedule[];
  onAction: (id: number, action: "accept" | "decline") => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
      <div className="p-6 border-b border-gray-100">
        <h2 className="text-lg font-bold">공유 받은 일정</h2>
        <p className="text-sm text-gray-500 mt-1">친구들이 공유한 여행 일정</p>
      </div>

      {schedules.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {schedules.map((schedule) => (
            <div
              key={schedule.id}
              className="p-5 hover:bg-gray-50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-gray-200">
                    <Image
                      src={schedule.sharedBy.image || "/placeholder.svg"}
                      alt={schedule.sharedBy.name}
                      width={48}
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-500">
                        <span className="font-bold text-gray-900">
                          {schedule.sharedBy.name}
                        </span>
                        님이 일정을 공유했습니다
                      </p>
                      {schedule.status === "accepted" && (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          수락됨
                        </span>
                      )}
                      {schedule.status === "declined" && (
                        <span className="bg-gray-100 text-gray-800 text-xs px-2 py-0.5 rounded-full">
                          거절됨
                        </span>
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="font-medium text-gray-900">
                        {schedule.title}
                      </p>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>{schedule.date}</span>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-gray-500">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span>{schedule.location}</span>
                      </div>
                    </div>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{schedule.sharedAt}에 공유됨</span>
                    </div>
                  </div>
                </div>

                {schedule.status === "pending" ? (
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                      onClick={() => onAction(schedule.id, "decline")}
                    >
                      거절
                    </Button>
                    <Button
                      size="sm"
                      className="rounded-full bg-black hover:bg-gray-800 text-white"
                      onClick={() => onAction(schedule.id, "accept")}
                    >
                      수락
                    </Button>
                  </div>
                ) : (
                  <Link href={`/schedules/${schedule.id}`} className="ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      일정 보기
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-2">
            공유 받은 일정이 없습니다
          </h3>
          <p className="text-gray-500 mb-4">
            친구들이 일정을 공유하면 여기에 표시됩니다.
          </p>
        </div>
      )}
    </div>
  );
}
