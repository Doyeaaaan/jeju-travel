"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, MapPin, Clock, Users, Plus, Minus } from "lucide-react"
import { upcomingTrips, pastTrips } from "@/data/trips"

const trips = [...upcomingTrips, ...pastTrips]

type ExpenseCategory = {
  id: string
  name: string
  amount: number
}

export default function ScheduleDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const trip = trips.find((trip) => trip.id === id)
  const [userEmail, setUserEmail] = useState("")
  const [showExpenseDetail, setShowExpenseDetail] = useState(false)
  const [expenses, setExpenses] = useState<ExpenseCategory[]>([
    { id: "airfare", name: "항공권", amount: 0 },
    { id: "accommodation", name: "숙소", amount: 0 },
    { id: "tourism", name: "관광비", amount: 0 },
    { id: "food", name: "식비", amount: 0 },
    { id: "transportation", name: "교통비", amount: 0 },
    { id: "other", name: "기타 비용", amount: 0 },
  ])
  const [numberOfPeople, setNumberOfPeople] = useState(1)
  const [calculatePerPerson, setCalculatePerPerson] = useState(false)

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user?.email) {
      alert("로그인이 필요합니다.")
      router.replace("/login")
      return
    }
    setUserEmail(user.email)
  }, [router])

  useEffect(() => {
    if (!userEmail || !id) return
    const prefix = `${id}_${userEmail}`

    const savedExpenses = localStorage.getItem(`trip_expenses_${prefix}`)
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    }

    const savedPeople = localStorage.getItem(`trip_people_${prefix}`)
    if (savedPeople) {
      setNumberOfPeople(Number(savedPeople))
    }

    const savedCalcPer = localStorage.getItem(`trip_calculate_per_person_${prefix}`)
    if (savedCalcPer) {
      setCalculatePerPerson(savedCalcPer === "true")
    }
  }, [id, userEmail])

  useEffect(() => {
    if (!userEmail || !id) return
    const prefix = `${id}_${userEmail}`

    localStorage.setItem(`trip_expenses_${prefix}`, JSON.stringify(expenses))
    localStorage.setItem(`trip_people_${prefix}`, numberOfPeople.toString())
    localStorage.setItem(`trip_calculate_per_person_${prefix}`, calculatePerPerson.toString())
  }, [expenses, numberOfPeople, calculatePerPerson, id, userEmail])

  const handleExpenseChange = (id: string, amount: number) => {
    setExpenses(expenses.map((exp) => exp.id === id ? { ...exp, amount } : exp))
  }

  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const perPersonExpense = totalExpense / numberOfPeople

  if (!trip) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h1 className="text-2xl font-bold">여행 일정을 찾을 수 없습니다</h1>
        <Link href="/schedules" className="text-black underline mt-2">일정 목록으로 돌아가기</Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 상단 헤더 및 여행 정보, 비용 계산 UI는 기존 코드와 동일하게 유지 */}
      {/* 위 코드를 그대로 포함하면 됩니다. */}
    </div>
  )
}
