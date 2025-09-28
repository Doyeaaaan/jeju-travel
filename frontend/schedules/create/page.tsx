"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

export default function CreateTripPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [location, setLocation] = useState("")
  const [description, setDescription] = useState("")
  const [days, setDays] = useState([
    {
      date: "",
      activities: [{ title: "", time: "", description: "", location: "" }],
    },
  ])

  const addDay = () => {
    setDays([...days, { date: "", activities: [{ title: "", time: "", description: "", location: "" }] }])
  }

  const addActivity = (dayIndex: number) => {
    const newDays = [...days]
    newDays[dayIndex].activities.push({ title: "", time: "", description: "", location: "" })
    setDays(newDays)
  }

  const removeActivity = (dayIndex: number, activityIndex: number) => {
    const newDays = [...days]
    newDays[dayIndex].activities.splice(activityIndex, 1)
    setDays(newDays)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // 실제로는 API 호출을 통해 여행 일정을 저장할 것입니다.
    router.push("/schedules")
  }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="p-4 border-b flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          제곰제곰
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/mypage" className="text-sm">
            마이페이지
          </Link>
          <Link href="/login" className="text-sm">
            로그인
          </Link>
        </div>
      </div>

      {/* 여행 생성 폼 */}
      <div className="p-6">
        <Link href="/schedules" className="flex items-center text-gray-500 mb-6">
          <ArrowLeft size={18} className="mr-2" />
          모든 일정으로 돌아가기
        </Link>

        <h1 className="text-2xl font-bold mb-6">새 여행 일정 만들기</h1>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div>
              <label className="block mb-2 font-medium">여행 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="여행 제목을 입력하세요"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-2 font-medium">시작일</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 font-medium">종료일</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium">여행 장소</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="여행 장소를 입력하세요"
                required
              />
            </div>

            <div>
              <label className="block mb-2 font-medium">여행 소개</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md h-24"
                placeholder="여행에 대한 간단한 소개를 입력하세요"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">일정 상세</h2>

              {days.map((day, dayIndex) => (
                <div key={dayIndex} className="mb-8 p-4 border rounded-md">
                  <h3 className="font-bold mb-4">DAY {dayIndex + 1}</h3>

                  <div className="mb-4">
                    <label className="block mb-2 text-sm">날짜</label>
                    <input
                      type="date"
                      value={day.date}
                      onChange={(e) => {
                        const newDays = [...days]
                        newDays[dayIndex].date = e.target.value
                        setDays(newDays)
                      }}
                      className="w-full p-2 border rounded-md"
                    />
                  </div>

                  <h4 className="font-medium mb-2">활동</h4>
                  {day.activities.map((activity, activityIndex) => (
                    <div key={activityIndex} className="mb-4 p-3 bg-gray-50 rounded-md">
                      <div className="flex justify-between mb-2">
                        <h5 className="font-medium">활동 {activityIndex + 1}</h5>
                        {day.activities.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeActivity(dayIndex, activityIndex)}
                            className="text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <div>
                          <label className="block mb-1 text-xs">제목</label>
                          <input
                            type="text"
                            value={activity.title}
                            onChange={(e) => {
                              const newDays = [...days]
                              newDays[dayIndex].activities[activityIndex].title = e.target.value
                              setDays(newDays)
                            }}
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="활동 제목"
                          />
                        </div>
                        <div>
                          <label className="block mb-1 text-xs">시간</label>
                          <input
                            type="text"
                            value={activity.time}
                            onChange={(e) => {
                              const newDays = [...days]
                              newDays[dayIndex].activities[activityIndex].time = e.target.value
                              setDays(newDays)
                            }}
                            className="w-full p-2 border rounded-md text-sm"
                            placeholder="예: 09:00-11:00"
                          />
                        </div>
                      </div>

                      <div className="mb-2">
                        <label className="block mb-1 text-xs">설명</label>
                        <input
                          type="text"
                          value={activity.description}
                          onChange={(e) => {
                            const newDays = [...days]
                            newDays[dayIndex].activities[activityIndex].description = e.target.value
                            setDays(newDays)
                          }}
                          className="w-full p-2 border rounded-md text-sm"
                          placeholder="활동 설명"
                        />
                      </div>

                      <div>
                        <label className="block mb-1 text-xs">장소</label>
                        <input
                          type="text"
                          value={activity.location}
                          onChange={(e) => {
                            const newDays = [...days]
                            newDays[dayIndex].activities[activityIndex].location = e.target.value
                            setDays(newDays)
                          }}
                          className="w-full p-2 border rounded-md text-sm"
                          placeholder="활동 장소"
                        />
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addActivity(dayIndex)}
                    className="flex items-center text-blue-500 text-sm mt-2"
                  >
                    <Plus size={16} className="mr-1" />
                    활동 추가
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addDay}
                className="flex items-center px-4 py-2 border border-dashed rounded-md text-gray-500 w-full justify-center mt-4"
              >
                <Plus size={18} className="mr-2" />
                일차 추가
              </button>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Link href="/schedules" className="px-6 py-2 border rounded-md">
                취소
              </Link>
              <button type="submit" className="px-6 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600">
                일정 저장
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
