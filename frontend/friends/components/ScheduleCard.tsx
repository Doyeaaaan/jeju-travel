"use client";

import { Calendar, Check, MapPin } from "lucide-react";
import Image from "next/image";

interface ScheduleCardProps {
  id: number;
  title: string;
  date: string;
  location: string;
  image?: string;
  selected: boolean;
  onToggle: (id: number) => void;
}

export default function ScheduleCard({
  id,
  title,
  date,
  location,
  image,
  selected,
  onToggle,
}: ScheduleCardProps) {
  return (
    <div
      className={`p-3 border rounded-lg flex items-center gap-4 cursor-pointer transition-colors ${
        selected
          ? "border-black bg-gray-50"
          : "border-gray-200 hover:bg-gray-50"
      }`}
      onClick={() => onToggle(id)}
    >
      <div className="relative w-20 h-16 rounded-md overflow-hidden flex-shrink-0">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex-grow">
        <h4 className="font-medium text-sm">{title}</h4>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <Calendar className="h-3 w-3 mr-1" />
          <span>{date}</span>
        </div>
        <div className="flex items-center mt-1 text-xs text-gray-500">
          <MapPin className="h-3 w-3 mr-1" />
          <span>{location}</span>
        </div>
      </div>
      <div className="w-5 h-5 rounded-full border border-gray-300 flex items-center justify-center flex-shrink-0">
        {selected && <Check className="h-3 w-3 text-black" />}
      </div>
    </div>
  );
}
