"use client";

import { Calendar, Check, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type Friend } from "@/lib/friend-service";

interface Schedule {
  id: number;
  title: string;
  date: string;
  location: string;
  image?: string;
}

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  friend: Friend | null;
  schedules: Schedule[];
  selectedScheduleIds: number[];
  onScheduleSelect: (ids: number[]) => void;
}

export default function ShareModal({
  open,
  onClose,
  friend,
  schedules,
  selectedScheduleIds,
  onScheduleSelect,
}: ShareModalProps) {
  const handleScheduleToggle = (scheduleId: number) => {
    const newSelectedIds = selectedScheduleIds.includes(scheduleId)
      ? selectedScheduleIds.filter(id => id !== scheduleId)
      : [...selectedScheduleIds, scheduleId];
    onScheduleSelect(newSelectedIds);
  };

  const handleShare = () => {
    if (selectedScheduleIds.length > 0) {
      alert(`${friend?.nickname}님에게 선택한 일정을 공유했습니다!`);
      onClose();
      onScheduleSelect([]);
    } else {
      alert("공유할 일정을 선택해주세요.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>일정 공유하기</DialogTitle>
          <DialogDescription>
            {friend?.nickname}님에게 공유할 여행 일정을 선택해주세요.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-4">
          {schedules.length > 0 ? (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`p-3 border rounded-lg flex items-center gap-4 cursor-pointer transition-colors ${
                    selectedScheduleIds.includes(schedule.id)
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => handleScheduleToggle(schedule.id)}
                >
                  <div className="relative w-20 h-16 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={schedule.image || "/placeholder.svg"}
                      alt={schedule.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-medium text-sm">{schedule.title}</h4>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{schedule.date}</span>
                    </div>
                    <div className="flex items-center mt-1 text-xs text-gray-500">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span>{schedule.location}</span>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0">
                    {selectedScheduleIds.includes(schedule.id) && (
                      <Check className="h-3 w-3 text-black" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">공유할 수 있는 일정이 없습니다.</p>
              <p className="text-sm text-gray-400 mt-1">
                먼저 여행 일정을 만들어보세요!
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="rounded-full">
            취소
          </Button>
          <Button 
            onClick={handleShare}
            disabled={selectedScheduleIds.length === 0}
            className="rounded-full bg-black hover:bg-gray-800"
          >
            공유하기 ({selectedScheduleIds.length})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
