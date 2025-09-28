export const upcomingTrips = [
  {
    id: "1",
    title: "제주도 여름 휴가",
    destination: "제주도",
    startDate: "2024-07-15",
    endDate: "2024-07-19",
    image: "/placeholder.svg?height=160&width=400",
    description: "제주도에서의 여름 휴가 일정입니다.",
    duration: "4박 5일",
    companions: "가족",
    locations: ["제주공항", "성산일출봉", "해변"],
    itinerary: [
      {
        date: "2024-07-15",
        activities: [
          {
            time: "09:00 - 11:00",
            title: "제주공항 도착",
            location: "제주국제공항",
            cost: 0,
          },
          {
            time: "12:00 - 14:00",
            title: "점심 식사",
            location: "제주시 맛집",
            cost: 50000,
          },
          {
            time: "15:00 - 18:00",
            title: "성산일출봉 관광",
            location: "성산일출봉",
            cost: 20000,
          },
        ],
      },
      {
        date: "2024-07-16",
        activities: [
          {
            time: "09:00 - 12:00",
            title: "우도 여행",
            location: "우도",
            cost: 30000,
          },
          {
            time: "13:00 - 15:00",
            title: "점심 식사",
            location: "해녀의 집",
            cost: 40000,
          },
        ],
      },
    ],
  },
  {
    id: "2",
    title: "설악산 단풍 여행",
    destination: "강원도 속초",
    startDate: "2024-10-20",
    endDate: "2024-10-22",
    image: "/placeholder.svg?height=160&width=400",
    description: "가을 단풍을 보러 설악산으로 떠나는 여행입니다.",
    duration: "2박 3일",
    companions: "친구들",
    locations: ["설악산", "속초해변"],
    itinerary: [
      {
        date: "2024-10-20",
        activities: [
          {
            time: "10:00 - 12:00",
            title: "설악산 도착",
            location: "설악산 국립공원",
            cost: 0,
          },
          {
            time: "13:00 - 18:00",
            title: "등산",
            location: "설악산 등산로",
            cost: 10000,
          },
        ],
      },
    ],
  },
]

export const pastTrips = [
  {
    id: "3",
    title: "부산 먹방 여행",
    destination: "부산",
    startDate: "2023-12-24",
    endDate: "2023-12-26",
    image: "/placeholder.svg?height=128&width=300",
    description: "부산의 맛집을 탐방하는 여행입니다.",
    duration: "2박 3일",
    companions: "친구",
    locations: ["해운대", "광안리", "자갈치시장"],
    itinerary: [
      {
        date: "2023-12-24",
        activities: [
          {
            time: "11:00 - 13:00",
            title: "부산역 도착",
            location: "부산역",
            cost: 0,
          },
          {
            time: "14:00 - 16:00",
            title: "해운대 방문",
            location: "해운대 해수욕장",
            cost: 0,
          },
        ],
      },
    ],
  },
  {
    id: "4",
    title: "교토 벚꽃 여행",
    destination: "일본 교토",
    startDate: "2024-04-05",
    endDate: "2024-04-09",
    image: "/placeholder.svg?height=128&width=300",
    description: "일본 교토에서 벚꽃 구경하는 여행입니다.",
    duration: "4박 5일",
    companions: "혼자",
    locations: ["기요미즈데라", "금각사"],
    itinerary: [
      {
        date: "2024-04-05",
        activities: [
          {
            time: "09:00 - 11:00",
            title: "교토 도착",
            location: "교토 공항",
            cost: 0,
          },
        ],
      },
    ],
  },
  {
    id: "5",
    title: "제주도 가을 여행",
    destination: "제주도",
    startDate: "2023-10-01",
    endDate: "2023-10-05",
    image: "/placeholder.svg?height=128&width=300",
    description: "제주도의 가을 풍경을 즐기는 여행입니다.",
    duration: "4박 5일",
    companions: "가족",
    locations: ["성산일출봉", "섭지코지"],
    itinerary: [
      {
        date: "2023-10-01",
        activities: [
          {
            time: "10:00 - 12:00",
            title: "제주공항 도착",
            location: "제주국제공항",
            cost: 0,
          },
        ],
      },
    ],
  },
]

export const trips = [...upcomingTrips, ...pastTrips]
