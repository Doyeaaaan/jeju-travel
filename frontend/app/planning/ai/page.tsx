"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Calendar, ChevronLeft, ArrowRight, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PlanningAIPage() {
  const router = useRouter()
  const [selectedStartDate, setSelectedStartDate] = useState<Date | null>(null)
  const [selectedEndDate, setSelectedEndDate] = useState<Date | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedStartDate || !selectedEndDate) {
      alert("여행 날짜를 선택해주세요.")
      return
    }

    const tripData = {
      startDate: selectedStartDate.toISOString().split("T")[0],
      endDate: selectedEndDate.toISOString().split("T")[0],
      travelers: 2, // 기본값으로 2명 설정
    }
    localStorage.setItem("aiTripData", JSON.stringify(tripData))
    router.push("/planning/ai/keywords")
  }

  const formatDate = (date: Date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ["일", "월", "화", "수", "목", "금", "토"]
    const weekday = weekdays[date.getDay()]
    return `${month}월 ${day}일 (${weekday})`
  }

  const calculateDuration = () => {
    if (!selectedStartDate || !selectedEndDate) return null
    const nights = Math.ceil((selectedEndDate.getTime() - selectedStartDate.getTime()) / (1000 * 60 * 60 * 24))
    const days = nights + 1
    return { nights, days }
  }

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate()
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay()

  const handleDateClick = (date: Date) => {
    if (!selectedStartDate || (selectedStartDate && selectedEndDate)) {
      setSelectedStartDate(date)
      setSelectedEndDate(null)
    } else {
      if (date < selectedStartDate) {
        setSelectedStartDate(date)
        setSelectedEndDate(selectedStartDate)
      } else {
        setSelectedEndDate(date)
      }
    }
  }

  const isDateSelected = (date: Date) => {
    if (!selectedStartDate) return false
    if (!selectedEndDate) return date.toDateString() === selectedStartDate.toDateString()
    return date >= selectedStartDate && date <= selectedEndDate
  }

  const isStartDate = (date: Date) => selectedStartDate && date.toDateString() === selectedStartDate.toDateString()
  const isEndDate = (date: Date) => selectedEndDate && date.toDateString() === selectedEndDate.toDateString()

  const nextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
  }

  const prevMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
  }

  const renderCalendar = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)

    const days = []
    days.push(
      <div key="header" className="grid grid-cols-7 mb-2">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
          <div key={`header-${index}`} className="text-center py-2 font-medium text-sm">
            {day}
          </div>
        ))}
      </div>,
    )

    const dayGrid = []

    for (let i = 0; i < firstDay; i++) {
      dayGrid.push(<div key={`prev-${i}`} className="text-gray-300 p-2 text-center"></div>)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(year, month, i)
      const isToday = new Date().toDateString() === currentDate.toDateString()
      const isSelected = isDateSelected(currentDate)
      const isStart = isStartDate(currentDate)
      const isEnd = isEndDate(currentDate)

      dayGrid.push(
        <div
          key={`current-${i}`}
          className={`p-2 text-center cursor-pointer relative ${isToday ? "font-bold" : ""}`}
          onClick={() => handleDateClick(currentDate)}
        >
          <div
            className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full text-sm
              ${
                isSelected
                  ? isStart && isEnd
                    ? "bg-primary text-white"
                    : isStart
                      ? "bg-primary text-white"
                      : isEnd
                        ? "bg-primary text-white"
                        : "bg-orange-200 text-orange-800"
                  : "hover:bg-gray-100"
              }`}
          >
            {i}
          </div>
        </div>,
      )
    }

    days.push(
      <div key="days" className="grid grid-cols-7">
        {dayGrid}
      </div>,
    )

    return days
  }

  const duration = calculateDuration()

  return (
    <div className="max-w-full mx-auto bg-white min-h-screen">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="max-w-4xl mx-auto flex items-center">
          <Link href="/planning" className="flex items-center text-gray-600 hover:text-gray-800">
            <ChevronLeft size={20} className="mr-1" />
            이전으로
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">키워드 여행 플래너</h1>
          <p className="text-xl text-muted-foreground">
            여행 날짜와 인원을 입력하면 최적의 제주도 여행 일정을 추천해드립니다
          </p>
        </div>

        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader className="text-center pb-6 relative">
            <CardTitle className="text-2xl text-foreground">여행 정보 입력</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleNext} className="space-y-8">
              <div className="space-y-6">
                <label className="flex items-center text-lg font-semibold text-foreground mb-4">
                  <Calendar className="w-6 h-6 mr-3 text-primary" />
                  여행 날짜 선택
                </label>

                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-4">
                  <button type="button" onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded">
                    <ChevronLeft size={20} />
                  </button>
                  <h3 className="text-lg font-semibold">
                    {currentMonth.getFullYear()}년 {currentMonth.getMonth() + 1}월
                  </h3>
                  <button type="button" onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded">
                    <ChevronRight size={20} />
                  </button>
                </div>

                {/* Calendar */}
                <div className="bg-white border rounded-lg p-4 mb-6">{renderCalendar(currentMonth)}</div>

                {/* Date Summary */}
                {selectedStartDate && selectedEndDate && duration && (
                  <div className="bg-orange-50 p-6 rounded-xl border border-orange-200">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-foreground mb-2">
                        {formatDate(selectedStartDate)} ~ {formatDate(selectedEndDate)}
                      </p>
                      <p className="text-primary font-bold text-2xl">
                        {duration.nights}박 {duration.days}일
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Next Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl"
                  disabled={!selectedStartDate || !selectedEndDate}
                >
                  다음
                  <ArrowRight className="w-6 h-6 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
