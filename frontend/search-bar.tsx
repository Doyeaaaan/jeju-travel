"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export default function SearchBar() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-xs">
      <input
        type="text"
        placeholder="여행지, 숙소, 맛집 검색..."
        className="pl-9 pr-4 py-2 border rounded-full text-sm w-full focus:border-orange-300 focus:ring focus:ring-orange-200 focus:ring-opacity-50 transition-all"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <button type="submit" className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <Search size={16} className="text-orange-400" />
      </button>
    </form>
  )
}
