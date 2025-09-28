export const travelCourses = [
  {
    id: 1,
    title: "제주 동부 3일 완벽 코스",
    description:
      "성산일출봉 오름, 산방산과 바다를 등 제주 동부의 아름다운 명소들을 3일 동안 효율적으로 둘러볼 수 있는 코스입니다.",
    image: "/placeholder.svg?height=200&width=300",
    days: 3,
    tags: ["성산일출봉", "우도", "월정리해변", "맛집"],
    author: "제주여행전문가",
    likes: 1243,
    itinerary: [
      {
        day: 1,
        title: "성산일출봉과 우도",
        spots: [
          {
            name: "성산일출봉",
            time: "08:00-10:00",
            description: "일출 명소로 유명한 성산일출봉에서 아침을 시작하세요.",
          },
          {
            name: "우도 여행",
            time: "10:30-16:00",
            description: "성산항에서 페리를 타고 우도로 이동하여 하루 동안 우도를 탐험하세요.",
          },
          {
            name: "해녀의 집",
            time: "18:00-19:30",
            description: "저녁은 해녀들이 운영하는 식당에서 신선한 해산물을 즐기세요.",
          },
        ],
      },
      {
        day: 2,
        title: "제주 동부 해변과 오름",
        spots: [
          {
            name: "월정리 해변",
            time: "09:00-11:00",
            description: "에메랄드빛 바다가 아름다운 월정리 해변에서 여유로운 아침을 보내세요.",
          },
          {
            name: "김녕 미로공원",
            time: "11:30-13:00",
            description: "세계에서 가장 큰 미로공원 중 하나인 김녕 미로공원을 방문하세요.",
          },
          {
            name: "만장굴",
            time: "14:00-16:00",
            description: "세계적으로 유명한 용암동굴인 만장굴을 탐험하세요.",
          },
          {
            name: "함덕 해수욕장",
            time: "16:30-18:30",
            description: "하얀 모래와 맑은 바다가 특징인 함덕 해수욕장에서 해변 산책을 즐기세요.",
          },
        ],
      },
      {
        day: 3,
        title: "제주 동부 문화 탐방",
        spots: [
          {
            name: "제주 민속촌",
            time: "09:00-12:00",
            description: "제주의 전통 생활 방식과 문화를 체험할 수 있는 민속촌을 방문하세요.",
          },
          {
            name: "성읍 민속마을",
            time: "13:00-15:00",
            description: "조선시대 제주의 모습을 간직한 성읍 민속마을을 둘러보세요.",
          },
          {
            name: "표선 해비치",
            time: "15:30-17:30",
            description: "넓은 백사장이 특징인 표선 해비치에서 여행의 마지막을 장식하세요.",
          },
        ],
      },
    ],
  },
  {
    id: 2,
    title: "제주 서부 2일 힐링 코스",
    description: "한림공원, 협재 해변 등 제주 서부의 아름다운 자연을 즐기는 힐링 여행 코스입니다.",
    image: "/placeholder.svg?height=200&width=300",
    days: 2,
    tags: ["협재해변", "한림공원", "카페", "올레길"],
    author: "제주도사랑꾼",
    likes: 876,
    itinerary: [],
  },
  {
    id: 3,
    title: "제주 맛집 투어 4일 코스",
    description: "제주의 유명 맛집들을 중심으로 구성된 식도락 여행 코스입니다.",
    image: "/placeholder.svg?height=200&width=300",
    days: 4,
    tags: ["맛집", "흑돼지", "해산물", "카페"],
    author: "제주미식가",
    likes: 1532,
    itinerary: [],
  },
]
