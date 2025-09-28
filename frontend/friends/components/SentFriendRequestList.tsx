"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { friendService, type FriendRequest } from "@/lib/friend-service"

interface SentFriendRequestListProps {
  requests: FriendRequest[]
  onRequestUpdate: () => void
}

export default function SentFriendRequestList({ requests, onRequestUpdate }: SentFriendRequestListProps) {
  const [processingRequests, setProcessingRequests] = useState<Set<number>>(new Set())
  const { toast } = useToast()

  // 강력한 날짜 포맷팅 함수
  const formatDate = (dateString: string) => {
      dateString,
      type: typeof dateString,
      length: dateString?.length
    })
    
    if (!dateString || dateString.trim() === '') {
      return '날짜 없음'
    }
    
    try {
      let date: Date
      
      // 다양한 날짜 형식 시도
      if (dateString.includes('T')) {
        // ISO 형식 처리
        if (!dateString.includes('Z') && !dateString.includes('+')) {
          // timezone 정보가 없는 경우 UTC로 처리
          date = new Date(dateString + 'Z')
        } else {
          date = new Date(dateString)
        }
      } else if (dateString.includes('/')) {
        // MM/DD/YYYY 또는 DD/MM/YYYY 형식
        date = new Date(dateString)
      } else if (dateString.includes('-')) {
        // YYYY-MM-DD 형식
        date = new Date(dateString)
      } else {
        // 기본 파싱 시도
        date = new Date(dateString)
      }
      
        original: dateString,
        parsed: date,
        isValid: !isNaN(date.getTime()),
        timestamp: date.getTime(),
        toISOString: date.toISOString()
      })
      
      if (isNaN(date.getTime())) {
        return '날짜 오류'
      }
      
      // 유효한 날짜인지 추가 검증 (연도 범위만 체크)
      const year = date.getFullYear()
      if (year < 1900 || year > 2200) {
        return '날짜 오류'
      }
      
      const formatted = date.toLocaleDateString("ko-KR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
      
      return formatted
    } catch (error) {
      return '날짜 오류'
    }
  }

  const handleCancel = async (requestId: number) => {
    if (processingRequests.has(requestId)) return

    setProcessingRequests(prev => new Set(prev).add(requestId))
    
    try {
      const success = await friendService.cancelFriendRequest(requestId)
      
      if (success) {
        toast({
          title: "친구 요청 취소",
          description: "친구 요청을 취소했습니다.",
        })
        onRequestUpdate()
      } else {
        toast({
          title: "오류",
          description: "친구 요청 취소에 실패했습니다.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "친구 요청 취소 중 오류가 발생했습니다.",
        variant: "destructive",
      })
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Badge variant="outline">보낸 요청</Badge>
            <span className="text-sm text-gray-500">({requests.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">보낸 친구 요청이 없습니다.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Badge variant="outline">보낸 요청</Badge>
          <span className="text-sm text-gray-500">({requests.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {requests.map((request) => (
          <div key={request.requestId} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={request.profileImage || "/placeholder.svg"}
                  alt={request.nickname}
                />
                <AvatarFallback>
                  {request.nickname.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-gray-900">{request.nickname}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(request.requestedAt)}
                </p>
                <p className="text-xs text-gray-400">대기 중...</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCancel(request.requestId)}
              disabled={processingRequests.has(request.requestId)}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {processingRequests.has(request.requestId) ? "취소 중..." : "요청 취소"}
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
