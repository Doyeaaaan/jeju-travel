"use client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TripList from "./TripList";
import ReviewList from "./ReviewList";
import LikeList from "./LikeList";

export default function TripTabs() {
  return (
    <Tabs defaultValue="trips" className="mt-8">
      <TabsList className="grid grid-cols-3 mb-4">
        <TabsTrigger
          value="trips"
          className="data-[state=active]:bg-black data-[state=active]:text-white"
        >
          여행 일정
        </TabsTrigger>
        <TabsTrigger value="reviews">리뷰</TabsTrigger>
        <TabsTrigger value="likes">좋아요</TabsTrigger>
      </TabsList>

      <TabsContent value="trips">
        <TripList />
      </TabsContent>
      <TabsContent value="reviews">
        <ReviewList />
      </TabsContent>
      <TabsContent value="likes">
        <LikeList />
      </TabsContent>
    </Tabs>
  );
}
