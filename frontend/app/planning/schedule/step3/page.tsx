"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, Check, MapPin, Star, Calendar } from "lucide-react"
import { accommodations } from "@/data/accommodations"

export default function PlanningStep3Page() {
  const router = useRouter()
  const [tripStartDate, setTripStartDate] = useState("")
  const [tripEndDate, setTripEndDate] = useState("")
  const [selectedPlaces, setSelectedPlaces] = useState<number[]>([])
  const [selectedAccommodation, setSelectedAccommodation] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredAccommodations, setFilteredAccommodations] = useState(accommodations)
  const [activeTab, setActiveTab] = useState("제주시")
  const [activeSubTab, setActiveSubTab] = useState("호텔")
  const [activeCategory, setActiveCategory] = useState("숙소 유형")
  const [showDateModal, setShowDateModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}")
    if (!user?.email) {
      alert("로그인이 필요합니다.")
      router.replace("/login")
      return
    }
    const email = user.email
    setUserEmail(email)

    const prefix = (key: string) => `${key}-${email}`
    const storedStartDate = localStorage.getItem(prefix("tripStartDate"))
    const storedEndDate = localStorage.getItem(prefix("tripEndDate"))
    const storedPlaces = localStorage.getItem(prefix("selectedPlaces"))

    if (storedStartDate) setTripStartDate(storedStartDate)
    if (storedEndDate) setTripEndDate(storedEndDate)
    if (storedPlaces) setSelectedPlaces(JSON.parse(storedPlaces))
  }, [router])

  useEffect(() => {
    let items = accommodations

    if (searchQuery) {
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (activeTab !== "전체") {
      if (activeTab === "제주시") {
        items = items.filter((item) => item.location?.includes("제주시"))
      } else if (activeTab === "서귀포시") {
        items = items.filter((item) => item.location?.includes("서귀포시"))
      }
    }

    if (activeSubTab === "호텔") {
      items = items.filter((item) => item.name.includes("호텔") || item.description.includes("호텔"))
    } else if (activeSubTab === "펜션") {
      items = items.filter((item) => item.name.includes("펜션") || item.description.includes("펜션"))
    } else if (activeSubTab === "리조트") {
      items = items.filter((item) => item.name.includes("리조트") || item.description.includes("리조트"))
    }

    setFilteredAccommodations(items)
  }, [searchQuery, activeTab, activeSubTab])

  const handleAccommodationSelect = (id: number) => {
    setSelectedAccommodation(id)
    setShowDateModal(true)
  }

  const handleDateSelect = () => {
    setShowDateModal(false)
  }

  const handleNext = () => {
    if (selectedAccommodation && userEmail) {
      const prefix = (key: string) => `${key}-${userEmail}`
      localStorage.setItem(prefix("selectedAccommodation"), selectedAccommodation.toString())
      localStorage.setItem(prefix("accommodationDate"), selectedDate || "")
      router.push("/planning/schedule/step4")
    }
  }

  const formatPrice = (price: string) => {
    if (!price) return ""
    const numericPrice = price.replace(/[^0-9]/g, "")
    if (!numericPrice) return price
    return Number.parseInt(numericPrice).toLocaleString() + "원"
  }

  const mainTabs = [
    { id: "제주시", label: "제주시" },
    { id: "제주시 서부", label: "제주시 서부" },
    { id: "제주시 동부", label: "제주시 동부" },
    { id: "서귀포시", label: "서귀포시" },
    { id: "서귀포시 서부", label: "서귀포시 서부" },
    { id: "서귀포시 동부", label: "서귀포시 동부" },
  ]

  const subTabs = [
    { id: "호텔", label: "호텔" },
    { id: "펜션", label: "펜션" },
    { id: "리조트", label: "리조트" },
    { id: "게스트하우스", label: "게스트하우스" },
    { id: "풀빌라", label: "풀빌라" },
  ]

  const filterCategories = [
    { id: "숙소 유형", label: "숙소 유형" },
    { id: "가격 범위", label: "가격 범위" },
    { id: "편의시설", label: "편의시설" },
  ]

  return (
    <>{/* 기존 UI 렌더링 부분은 변경하지 않음, 위 로직만 이메일 기반으로 수정됨 */}</>
  )
}
