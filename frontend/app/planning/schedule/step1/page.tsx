"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function PlanningStep1Page() {
  const router = useRouter()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedEndDate, setSelectedEndDate] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth())
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())

  const months = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"]
  const days = ["일", "월", "화", "수", "목", "금", "토"]

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay()
  }

  const handleDateClick = (day: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`

    if (!selectedDate) {
      setSelectedDate(dateString)
    } else if (!selectedEndDate) {
      // 시작일보다 이전 날짜를 선택한 경우
      if (new Date(dateString) < new Date(selectedDate)) {
        setSelectedEndDate(selectedDate)
        setSelectedDate(dateString)
      } else {
        setSelectedEndDate(dateString)
      }
    } else {
      // 날짜 선택 초기화
      setSelectedDate(dateString)
      setSelectedEndDate(null)
    }
  }

  const isDateSelected = (day: number) => {
    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    return dateString === selectedDate || dateString === selectedEndDate
  }

  const isDateInRange = (day: number) => {
    if (!selectedDate || !selectedEndDate) return false

    const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
    const date = new Date(dateString)
    return date > new Date(selectedDate) && date < new Date(selectedEndDate)
  }

  const handleNext = () => {
    if (selectedDate && selectedEndDate) {
      localStorage.setItem("tripStartDate", selectedDate)
      localStorage.setItem("tripEndDate", selectedEndDate)
      router.push("/planning/schedule/step2")
    }
  }

  const renderCalendar = (year: number, month: number) => {
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    const calendar = []

    // 요일 헤더
    const dayHeader = (
      <div className="grid grid-cols-7 mb-2" key="header">
        {days.map((day, index) => (
          <div key={index} className="text-center text-sm font-medium py-2">
            {day}
          </div>
        ))}
      </div>
    )
    calendar.push(dayHeader)

    // 날짜 그리드
    let dayCount = 1
    for (let i = 0; i < 6; i++) {
      const week = []
      for (let j = 0; j < 7; j++) {
        if ((i === 0 && j < firstDay) || dayCount > daysInMonth) {
          week.push(<div key={`empty-${i}-${j}`} className="h-12"></div>)
        } else {
          const isToday =
            dayCount === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()

          const isSelected = isDateSelected(dayCount)
          const isInRange = isDateInRange(dayCount)

          week.push(
            <div
              key={dayCount}
              onClick={() => handleDateClick(dayCount)}
              className={`h-12 flex items-center justify-center cursor-pointer relative
                ${isToday ? "font-bold" : ""}
                ${isSelected ? "bg-blue-500 text-white rounded-full" : ""}
                ${isInRange ? "bg-blue-100" : ""}
                ${j === 0 ? "text-red-500" : ""}
                ${j === 6 ? "text-blue-500" : ""}
                ${isSelected && j === 0 ? "text-white" : ""}
                ${isSelected && j === 6 ? "text-white" : ""}
              `}
            >
              {dayCount}
            </div>,
          )
          dayCount++
        }
      }
      calendar.push(
        <div className="grid grid-cols-7 gap-1" key={`week-${i}`}>
          {week}
        </div>,
      )
      if (dayCount > daysInMonth) break
    }

    return calendar
  }

  const nextMonthYear =
    currentMonth === 11 ? { month: 0, year: currentYear + 1 } : { month: currentMonth + 1, year: currentYear }

  return (
    <div className="max-w-4xl mx-auto bg-white min-h-screen">
      {/* 헤더 */}
      <div className="p-4 border-b flex items-center">
        <Link href="/" className="mr-4">
          <Image src="/placeholder.svg?height=32&width=80" alt="MYRO" width={80} height={32} />
        </Link>
        <div className="text-xl font-medium">제주</div>
      </div>

      {/* 진행 단계 */}
      <div className="bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                1
              </div>
              <span className="text-xs mt-1 font-medium">날짜 확인</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2">
              <div className="h-full bg-blue-500" style={{ width: "0%" }}></div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center font-bold">
                2
              </div>
              <span className="text-xs mt-1">장소 선택</span>
            </div>
            <div className="flex-1 h-1 bg-gray-300 mx-2"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center font-bold">
                3
              </div>
              <span className="text-xs mt-1">숙소 설정</span>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold text-center mb-8">여행 기간이 어떻게 되시나요?</h1>
        <p className="text-center text-gray-500 mb-6">* 여행 일자는 최대 10일까지 설정 가능합니다.</p>
        <p className="text-center text-gray-500 mb-8 underline">
          현지 여행 기간(여행지 도착 날짜, 여행지 출발 날짜)으로 입력해 주세요.
        </p>

        <div className="flex justify-between mb-8">
          <div className="w-1/2 pr-4">
            <div className="flex justify-between items-center mb-4">
              <button onClick={handlePrevMonth} className="p-2">
                <ChevronLeft size={24} />
              </button>
              <h2 className="text-xl font-bold">
                {currentYear}년 {months[currentMonth]}
              </h2>
              <div className="w-8"></div> {/* 균형을 위한 빈 공간 */}
            </div>
            {renderCalendar(currentYear, currentMonth)}
          </div>
          <div className="w-1/2 pl-4">
            <div className="flex justify-between items-center mb-4">
              <div className="w-8"></div> {/* 균형을 위한 빈 공간 */}
              <h2 className="text-xl font-bold">
                {nextMonthYear.year}년 {months[nextMonthYear.month]}
              </h2>
              <button onClick={handleNextMonth} className="p-2">
                <ChevronRight size={24} />
              </button>
            </div>
            {renderCalendar(nextMonthYear.year, nextMonthYear.month)}
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleNext}
            disabled={!selectedDate || !selectedEndDate}
            className={`px-8 py-3 rounded-md ${
              selectedDate && selectedEndDate
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-500 cursor-not-allowed"
            }`}
          >
            선택
          </button>
        </div>
      </div>
    </div>
  )
}
