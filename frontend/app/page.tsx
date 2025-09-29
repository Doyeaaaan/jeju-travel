"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Calendar, UtensilsCrossed } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { attractionService } from "@/lib/attraction-service";
import { useAuth } from "@/context/AuthContext";

// 프로덕션 환경에서 콘솔 로그 완전 비활성화
const log = () => {} // 빈 함수로 교체하여 모든 로그 비활성화

export default function HomePage() {
  const { user, isAuthenticated, authLoading } = useAuth();
  const [destinationsData, setDestinationsData] = useState<any[]>([]);
  const [restaurantsData, setRestaurantsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 관광지와 맛집 데이터 동시 로드 - 여러 엔드포인트 시도
        let attractions = [];
        let restaurants = [];

        // 관광지 데이터 로드
        try {
          attractions = await attractionService.getAttractions(1, 50);
        } catch (error) {
          try {
            const attractionsResponse = await fetch(
              "/api/visitjeju/attractions?offset=0&limit=50",
              {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            if (attractionsResponse.ok) {
              const attractionsText = await attractionsResponse.text();
              const trimmedText = attractionsText.trim();
              if (trimmedText.startsWith("[") || trimmedText.startsWith("{")) {
                attractions = JSON.parse(trimmedText);
              } else {
                const jsonStart = trimmedText.indexOf("[");
                const jsonEnd = trimmedText.lastIndexOf("]");
                if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
                  const jsonPart = trimmedText.substring(
                    jsonStart,
                    jsonEnd + 1
                  );
                  attractions = JSON.parse(jsonPart);
                }
              }
            }
          } catch (directError) {
            attractions = [];
          }
        }

        // 맛집 데이터 로드 (인증 없이)
        try {
          const restaurantsResponse = await fetch(
            "/api/visitjeju/import?page=1&size=50",
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!restaurantsResponse.ok) {
            throw new Error(`HTTP ${restaurantsResponse.status}`);
          }

          const restaurantsText = await restaurantsResponse.text();
            "🍽️ 맛집 API 응답 (처음 200자):",
            restaurantsText.substring(0, 200)
          );

          // JSON 배열이나 객체로 시작하는지 확인
          const trimmedText = restaurantsText.trim();
          if (trimmedText.startsWith("[") || trimmedText.startsWith("{")) {
            restaurants = JSON.parse(trimmedText);
          } else {
            // JSON이 아닌 경우, JSON 부분을 찾아서 파싱 시도
            const jsonStart = trimmedText.indexOf("[");
            const jsonEnd = trimmedText.lastIndexOf("]");

            if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
              const jsonPart = trimmedText.substring(jsonStart, jsonEnd + 1);
              restaurants = JSON.parse(jsonPart);
            } else {
                "⚠️ 첫 번째 엔드포인트에서 JSON 배열을 찾을 수 없음, 두 번째 엔드포인트 시도"
              );

              // 두 번째 시도: restaurants 전용 엔드포인트 (인증 없이)
              const restaurantsResponse2 = await fetch(
                "/api/visitjeju/restaurants?offset=0&limit=50",
                {
                  method: "GET",
                  headers: {
                    "Content-Type": "application/json",
                  },
                }
              );
              if (restaurantsResponse2.ok) {
                const restaurantsText2 = await restaurantsResponse2.text();
                const trimmedText2 = restaurantsText2.trim();
                if (
                  trimmedText2.startsWith("[") ||
                  trimmedText2.startsWith("{")
                ) {
                  restaurants = JSON.parse(trimmedText2);
                } else {
                  const jsonStart2 = trimmedText2.indexOf("[");
                  const jsonEnd2 = trimmedText2.lastIndexOf("]");
                  if (
                    jsonStart2 !== -1 &&
                    jsonEnd2 !== -1 &&
                    jsonEnd2 > jsonStart2
                  ) {
                    const jsonPart2 = trimmedText2.substring(
                      jsonStart2,
                      jsonEnd2 + 1
                    );
                    restaurants = JSON.parse(jsonPart2);
                  }
                }
              }
            }
          }
        } catch (error) {
          restaurants = [];
        }

        // 관광지 데이터 필터링 (모텔, 호텔, 숙소 등 제외)
        const filteredAttractions = Array.isArray(attractions)
          ? attractions
              .filter((item: any) => {
                if (!item || !item.name) return false;
                
                const name = item.name.toLowerCase();
                const address = (item.address || "").toLowerCase();
                const searchText = `${name} ${address}`;
                
                // 숙소 관련 키워드 제외
                const accommodationKeywords = [
                  "모텔", "motel", "호텔", "hotel", "펜션", "pension", 
                  "게스트하우스", "guesthouse", "리조트", "resort",
                  "민박", "숙소", "accommodation", "체크인", "check-in"
                ];
                
                const hasAccommodationKeyword = accommodationKeywords.some(keyword => 
                  searchText.includes(keyword)
                );
                
                if (hasAccommodationKeyword) return false;
                
                // 진짜 관광지 키워드 포함 확인
                const attractionKeywords = [
                  "공원", "park", "해변", "beach", "산", "mountain", "폭포", "waterfall",
                  "박물관", "museum", "미술관", "gallery", "유적", "historic", "성", "castle",
                  "절", "temple", "교회", "church", "기념관", "memorial", "전망대", "observatory",
                  "카페거리", "cafe street", "테마파크", "theme park", "수목원", "arboretum",
                  "한라산", "성산일출봉", "천지연폭포", "정방폭포", "용머리해안", "중문관광단지",
                  "제주민속촌", "제주올레", "올레길", "제주도립미술관", "제주4·3평화공원"
                ];
                
                const hasAttractionKeyword = attractionKeywords.some(keyword => 
                  searchText.includes(keyword)
                );
                
                return hasAttractionKeyword;
              })
              .map((item: any) => ({
                ...item,
                id: item.id || item.contentsId || String(Math.random()),
                name: item.name || "이름 없음",
                address: item.address || "주소 정보 없음",
                imageUrl: item.imageUrl || "/placeholder.svg",
                category: "c1",
              }))
          : [];

        // 맛집 데이터 필터링 (숙소, 관광지 등 제외)
        const filteredRestaurants = Array.isArray(restaurants)
          ? restaurants
              .filter((item: any) => {
                if (!item || !item.name) return false;
                
                const name = item.name.toLowerCase();
                const address = (item.address || "").toLowerCase();
                const searchText = `${name} ${address}`;
                
                // 숙소 관련 키워드 제외
                const accommodationKeywords = [
                  "모텔", "motel", "호텔", "hotel", "펜션", "pension", 
                  "게스트하우스", "guesthouse", "리조트", "resort",
                  "민박", "숙소", "accommodation", "체크인", "check-in"
                ];
                
                // 관광지 관련 키워드 제외 (맛집 섹션에서)
                const attractionKeywords = [
                  "공원", "park", "해변", "beach", "산", "mountain", "폭포", "waterfall",
                  "박물관", "museum", "미술관", "gallery", "유적", "historic", "성", "castle",
                  "절", "temple", "교회", "church", "기념관", "memorial", "전망대", "observatory",
                  "테마파크", "theme park", "수목원", "arboretum"
                ];
                
                const hasAccommodationKeyword = accommodationKeywords.some(keyword => 
                  searchText.includes(keyword)
                );
                
                const hasAttractionKeyword = attractionKeywords.some(keyword => 
                  searchText.includes(keyword)
                );
                
                if (hasAccommodationKeyword || hasAttractionKeyword) return false;
                
                // 맛집 키워드 포함 확인
                const restaurantKeywords = [
                  "식당", "restaurant", "카페", "cafe", "커피", "coffee", "맛집", "음식점",
                  "한식", "중식", "일식", "양식", "분식", "치킨", "chicken", "피자", "pizza",
                  "햄버거", "burger", "라면", "떡볶이", "족발", "보쌈", "갈비", "삼겹살",
                  "회", "sushi", "초밥", "파스타", "pasta", "스테이크", "steak", "샐러드", "salad",
                  "빵", "bread", "베이커리", "bakery", "디저트", "dessert", "아이스크림", "ice cream"
                ];
                
                const hasRestaurantKeyword = restaurantKeywords.some(keyword => 
                  searchText.includes(keyword)
                );
                
                return hasRestaurantKeyword;
              })
              .map((item: any) => ({
                ...item,
                id: item.id || item.contentsId || String(Math.random()),
                name: item.name || "이름 없음",
                address: item.address || "주소 정보 없음",
                imageUrl: item.imageUrl || "/placeholder.svg",
                category: "c4",
              }))
          : [];


        setDestinationsData(filteredAttractions);
        setRestaurantsData(filteredRestaurants);
      } catch (error) {
        setDestinationsData([]);
        setRestaurantsData([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {authLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      )}

      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        {/* 배경 이미지 */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/jeju.jpeg"
            alt="제주도 풍경"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          ]
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-10">
              <span className="inline-flex items-center bg-white/20 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-sm backdrop-blur-sm">
                <span className="text-2xl mr-2">🍊</span>
                제주도 여행의 새로운 경험
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight leading-tight">
              제주도 여행의
              <br />
              <span className="text-[#FF8F00]">모든 것</span>
            </h1>

            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              아름다운 제주도의 관광지, 맛집, 숙소를 한눈에 확인하고
              <br />
              제곰이와 함께 여행 계획을 세워보세요 🐻
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link href="/planning">
                <Button className="bg-white text-black hover:bg-white/90 rounded-full px-8 py-6 text-lg">
                  여행 계획 세우기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-orange-25 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              인기 관광지
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              제주도의 아름다운 명소를 만나보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200 rounded-2xl mb-6"></div>
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))
              : destinationsData.slice(0, 6).map((destination, index) => (
                  <Link
                    href={`/attractions/${destination.id}`}
                    key={destination.id}
                    className="block group"
                  >
                    <Card className="overflow-hidden border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white shadow-sm rounded-2xl">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={destination.imageUrl || "/placeholder.svg"}
                          alt={destination.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-2 text-lg">
                          {destination.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {destination.address}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>

          <div className="text-center">
            <Link href="/attractions">
              <Button className="bg-[rgba(255,143,0,0.7)] hover:bg-[rgba(255,143,0,0.85)] text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                <Search className="w-5 h-5 mr-3" />
                모든 관광지 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6 text-foreground">
              제주도 맛집
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              제주도의 맛있는 음식을 경험해보세요
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="aspect-[4/3] bg-gray-200 rounded-2xl mb-6"></div>
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))
              : restaurantsData.slice(0, 6).map((restaurant, index) => (
                  <Link
                    href={`/attractions/${restaurant.id}`}
                    key={restaurant.id}
                    className="block group"
                  >
                    <Card className="overflow-hidden border-0 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white shadow-sm rounded-2xl">
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <Image
                          src={restaurant.imageUrl || "/placeholder.svg"}
                          alt={restaurant.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg";
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      </div>
                      <CardContent className="p-6">
                        <h3 className="font-bold text-foreground group-hover:text-primary transition-colors mb-2 text-lg">
                          {restaurant.name}
                        </h3>
                        <p className="text-muted-foreground text-sm">
                          {restaurant.address}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
          </div>

          <div className="text-center">
            <Link href="/restaurants">
              <Button className="bg-[rgba(255,143,0,0.7)] hover:bg-[rgba(255,143,0,0.85)] text-white px-8 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1">
                <UtensilsCrossed className="w-5 h-5 mr-3" />
                모든 맛집 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-black text-white py-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 mg:grid-cols-2 gap-8 md:gap-12">
            <div className="md:pr-8">
              <h3 className="text-xl font-bold mb-4">재곰제곰</h3>
              <p className="text-gray-400 mb-4">
                제주도 여행의 모든 것을 한 곳에서 찾아보세요.
                <br />
                최고의 관광지, 숙소, 맛집 정보를 제공합니다.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-4">서비스</h4>
              <ul
                className="flex flex-wrap items-center gap-x-6 gap-y-2 
                 justify-center md:justify-start"
              >
                <li>
                  <Link
                    href="/attractions"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    관광지
                  </Link>
                </li>
                <li>
                  <Link
                    href="/accommodations"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    숙소
                  </Link>
                </li>
                <li>
                  <Link
                    href="/restaurants"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    맛집
                  </Link>
                </li>
                <li>
                  <Link
                    href="/flights"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    항공권
                  </Link>
                </li>
                <li>
                  <Link
                    href="/planning"
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    여행 계획
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-6 text-sm text-gray-400">
            <p className="text-center">© 2025 재곰제곰 All Rights Reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
