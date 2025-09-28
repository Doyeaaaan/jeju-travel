"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ChevronLeft, ArrowRight, MapPin, Home, UtensilsCrossed, Check, Coffee } from "lucide-react"
import { Button } from "@/components/ui/button"
import { recommendationService } from "@/lib/recommendation-service"
import type { KeywordRecommendationRequest } from "@/types/api-types"

const keywordData = {
  관광지: ["자연", "체험", "역사", "문화", "풍경"],
  숙소: ["경치", "힐링", "편안함", "청결", "서비스"],
  맛집: ["맛", "분위기", "가성비", "친절", "청결"],
  카페: ["뷰", "분위기", "디저트", "조용함", "인테리어"],
}

export default function KeywordsPage() {
  const router = useRouter()
  const [selectedKeywords, setSelectedKeywords] = useState<{ [key: string]: string[] }>({
    관광지: [],
    숙소: [],
    맛집: [],
    카페: [],
  })
  const [tripData, setTripData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const savedTripData = localStorage.getItem("aiTripData")
    if (!savedTripData) {
      router.push("/planning/ai")
      return
    }
    setTripData(JSON.parse(savedTripData))
  }, [router])

  const handleKeywordToggle = (category: string, keyword: string) => {
    setSelectedKeywords((prev) => {
      const currentKeywords = prev[category] || []
      const isSelected = currentKeywords.includes(keyword)

      if (isSelected) {
        // Remove keyword
        return {
          ...prev,
          [category]: currentKeywords.filter((k) => k !== keyword),
        }
      } else {
        // Add keyword (max 3 per category)
        if (currentKeywords.length >= 3) {
          return prev
        }
        return {
          ...prev,
          [category]: [...currentKeywords, keyword],
        }
      }
    })
  }

  const handleNext = async () => {
    const hasEnoughKeywords = Object.entries(selectedKeywords).every(([category, keywords]) => keywords.length >= 1)

    if (!hasEnoughKeywords) {
      alert("각 카테고리마다 최소 1개의 키워드를 선택해주세요.")
      return
    }

    setIsLoading(true)

    try {
      // API 요청 데이터 준비
      const request: KeywordRecommendationRequest = {
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        travelers: tripData.travelers,
        keywords: {
          관광지: selectedKeywords.관광지,
          맛집: selectedKeywords.맛집,
          숙소: selectedKeywords.숙소,
          카페: selectedKeywords.카페,
        },
        numOptions: 2
      }


      // API 호출
      const response = await recommendationService.getKeywordRecommendations(request)
      

      // API 응답이 성공인지 확인 (response.success가 true이고 response.data가 있는 경우)
      if (response && response.success === true && response.data) {
        // 성공 시 응답 데이터를 저장
        const updatedTripData = {
          ...tripData,
          keywords: selectedKeywords,
          recommendations: response.data,
        }
        localStorage.setItem("aiTripData", JSON.stringify(updatedTripData))
        router.push("/planning/ai/result")
      } else {
        throw new Error(response?.error?.message || "추천 요청에 실패했습니다.")
      }
    } catch (error: any) {
      
      // API 실패 시 더미 데이터로 폴백
      const mockResponse = recommendationService.generateMockRecommendations({
        startDate: tripData.startDate,
        endDate: tripData.endDate,
        travelers: tripData.travelers,
        keywords: {
          관광지: selectedKeywords.관광지,
          맛집: selectedKeywords.맛집,
          숙소: selectedKeywords.숙소,
          카페: selectedKeywords.카페,
        },
        numOptions: 2
      })

      const updatedTripData = {
        ...tripData,
        keywords: selectedKeywords,
        recommendations: mockResponse.data,
      }
      localStorage.setItem("aiTripData", JSON.stringify(updatedTripData))
      router.push("/planning/ai/result")
    } finally {
      setIsLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "관광지":
        return <MapPin className="w-5 h-5" />
      case "숙소":
        return <Home className="w-5 h-5" />
      case "맛집":
        return <UtensilsCrossed className="w-5 h-5" />
      case "카페":
        return <Coffee className="w-5 h-5" />
      default:
        return null
    }
  }

  if (!tripData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-accent border-t-transparent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 py-4">
          <Link
            href="/planning/ai"
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            이전
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-3 text-balance">여행 취향을 알려주세요</h1>
          <p className="text-muted-foreground text-lg">각 카테고리마다 1-3개의 키워드를 선택해주세요</p>
        </div>

        <div className="space-y-8">
          {Object.entries(keywordData).map(([category, keywords]) => (
            <div key={category} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    {getCategoryIcon(category)}
                  </div>
                  <h2 className="text-xl font-semibold text-foreground">{category}</h2>
                </div>
                <div className="text-sm text-muted-foreground">{selectedKeywords[category]?.length || 0}/3</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {keywords.map((keyword) => {
                  const isSelected = selectedKeywords[category]?.includes(keyword)
                  const isDisabled = !isSelected && selectedKeywords[category]?.length >= 3

                  return (
                    <button
                      key={keyword}
                      onClick={() => handleKeywordToggle(category, keyword)}
                      disabled={isDisabled}
                      className={`
                        relative p-4 rounded-lg border transition-all duration-200 text-left
                        ${
                          isSelected
                            ? "border-accent bg-accent/5 text-accent"
                            : isDisabled
                              ? "border-border bg-muted/50 text-muted-foreground cursor-not-allowed"
                              : "border-border bg-card hover:border-accent/50 hover:bg-accent/5 text-card-foreground"
                        }
                      `}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{keyword}</span>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                            <Check className="w-3 h-3 text-accent-foreground" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-12">
          <Button
            onClick={handleNext}
            disabled={isLoading}
            className="w-full h-14 text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent mr-2"></div>
                여행 일정 생성 중...
              </>
            ) : (
              <>
                여행 일정 생성하기
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
