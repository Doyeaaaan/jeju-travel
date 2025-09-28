import Image from "next/image"
import { travelCourses } from "@/data/travel-courses"
import { Calendar, User, Heart, Share2, Bookmark } from "lucide-react"

export default function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = travelCourses.find((c) => c.id.toString() === params.id) || travelCourses[0]

  return (
    <div className="max-w-4xl mx-auto bg-white pb-8">
      <div className="relative h-60 bg-gray-200">
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 z-10">배경사진</div>
        {course.image && (
          <Image src={course.image || "/placeholder.svg"} alt={course.title} fill className="object-cover z-20" />
        )}
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button className="p-2 bg-white rounded-full shadow-md">
            <Share2 size={20} />
          </button>
          <button className="p-2 bg-white rounded-full shadow-md">
            <Bookmark size={20} />
          </button>
          <button className="p-2 bg-white rounded-full shadow-md">
            <Heart size={20} />
          </button>
        </div>
      </div>

      <div className="p-6">
        <h1 className="text-2xl font-bold">{course.title}</h1>

        <div className="flex items-center mt-2 text-sm text-gray-500">
          <User size={16} className="mr-1" />
          <span className="mr-4">{course.author}</span>
          <Calendar size={16} className="mr-1" />
          <span className="mr-4">{course.days}일 코스</span>
          <Heart size={16} className="mr-1" />
          <span>{course.likes}</span>
        </div>

        <div className="mt-4">
          <p className="text-gray-700">{course.description}</p>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {course.tags.map((tag, index) => (
            <span key={index} className="bg-gray-200 text-xs px-2 py-1 rounded-full">
              # {tag}
            </span>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">여행 일정</h2>

          {course.itinerary.map((day) => (
            <div key={day.day} className="mb-6">
              <h3 className="text-md font-bold mb-2 bg-gray-100 p-2 rounded-md">
                DAY {day.day}: {day.title}
              </h3>

              <div className="space-y-4 pl-4">
                {day.spots.map((spot, index) => (
                  <div key={index} className="relative pl-6 border-l-2 border-gray-200 pb-4">
                    <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-gray-400"></div>
                    <div className="flex justify-between">
                      <h4 className="font-bold">{spot.name}</h4>
                      <span className="text-sm text-gray-500">{spot.time}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{spot.description}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h2 className="text-lg font-bold mb-4">지도</h2>
          <div className="h-80 bg-gray-200 rounded-md flex items-center justify-center">지도</div>
        </div>

        <div className="mt-8 flex gap-4">
          <button className="flex-1 py-3 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600">
            일정 저장하기
          </button>
          <button className="flex-1 py-3 border border-black rounded-md font-medium">수정 요청하기</button>
        </div>
      </div>
    </div>
  )
}
