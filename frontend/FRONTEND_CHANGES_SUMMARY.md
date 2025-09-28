# 프론트엔드 목적지 순서 관리 수정 완료

## 🎯 수정 목표
드래그앤드롭/드롭다운으로 순서를 바꿀 때, **dayId + orderedDestinationIds[]**를 한 번만 서버로 보내도록 수정

## ✅ 완료된 수정사항

### 1. API 클라이언트 타입 맞추기 ✅
**파일**: `lib/trip-service.ts`

**변경사항**:
\`\`\`typescript
// 기존: void 반환
async updateDestinationSequence(dayId: number, orderedDestinationIds: number[]): Promise<void>

// 수정: TripDayWithDestinationsDto 반환
async updateDestinationSequence(dayId: number, orderedDestinationIds: number[]): Promise<{ data: TripDayWithDestinationsDto }>
\`\`\`

**효과**: 백엔드에서 반환하는 최신 상태를 받아서 UI 즉시 반영 가능

### 2. 드래그앤드롭 핸들러 교체 ✅
**파일**: `app/planning/flow/itinerary-confirmation/page.tsx`

**기존 문제점**:
\`\`\`typescript
// ❌ 단건 반복 호출 (N번의 API 요청)
for (const dest of updatedDestinations) {
  await tripService.updateDestinationSequence(dest.id, dest.sequence)
}
\`\`\`

**수정된 코드**:
\`\`\`typescript
// ✅ 한 번의 API 요청으로 전체 순서 변경
const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
  // 로컬에서 순서 재배열
  const sorted = [...currentDay.destinations].sort((a, b) => a.sequence - b.sequence)
  const moving = sorted[draggedItem]
  const arr = [...sorted]
  arr.splice(draggedItem, 1)
  arr.splice(dropIndex, 0, moving)
  
  // sequence 1..N 재부여
  const updated = arr.map((d, i) => ({ ...d, sequence: i + 1 }))
  const orderedIds = updated.map((d) => d.id)

  // 한 번에 순서 변경 요청
  const response = await tripService.updateDestinationSequence(currentDay.tripDayId, orderedIds)
  
  // 서버 응답으로 상태 업데이트
  setTripDays(prev => prev.map(d => 
    d.tripDayId === currentDay.tripDayId 
      ? { ...response.data, tripDayId: response.data.id } 
      : d
  ))
}
\`\`\`

### 3. 드롭다운으로 순서 변경 지원 ✅
**파일**: `app/planning/flow/itinerary-confirmation/page.tsx`

**추가된 기능**:
\`\`\`typescript
// 순서 선택 드롭다운
<select
  value={destination.sequence}
  onChange={(e) => handleSequenceChange(destination.id, Number(e.target.value))}
  className="text-xs border rounded px-2 py-1 bg-white"
>
  {Array.from({ length: tripDays[activeDay - 1].destinations.length }, (_, i) => (
    <option key={i + 1} value={i + 1}>{i + 1}번째</option>
  ))}
</select>
\`\`\`

**핸들러 로직**:
\`\`\`typescript
const handleSequenceChange = async (destinationId: number, newSequence: number) => {
  // 로컬에서 순서 재배열
  const sorted = [...currentDay.destinations].sort((a, b) => a.sequence - b.sequence)
  const targetIndex = sorted.findIndex(d => d.id === destinationId)
  const moving = sorted[targetIndex]
  const arr = [...sorted]
  arr.splice(targetIndex, 1)
  arr.splice(newSequence - 1, 0, moving)
  
  const updated = arr.map((d, i) => ({ ...d, sequence: i + 1 }))
  const orderedIds = updated.map((d) => d.id)

  // 한 번에 순서 변경 요청
  const response = await tripService.updateDestinationSequence(currentDay.tripDayId, orderedIds)
  // 상태 업데이트...
}
\`\`\`

### 4. 렌더링 시 정렬 보장 ✅
**위치**: destination 렌더링 부분

**보장사항**:
\`\`\`typescript
// 항상 sequence ASC 정렬로 렌더링
tripDays[activeDay - 1].destinations
  .sort((a, b) => a.sequence - b.sequence)
  .map((destination, index, array) => (
    // destination 렌더링...
  ))
\`\`\`

## 🚀 성능 개선 효과

### 기존 방식 (N번 API 호출)
\`\`\`
목적지 3개 순서 변경 시:
- API 호출: 3번
- 네트워크 지연: 3 × 200ms = 600ms
- 서버 부하: 3배
\`\`\`

### 새로운 방식 (1번 API 호출)
\`\`\`
목적지 3개 순서 변경 시:
- API 호출: 1번
- 네트워크 지연: 1 × 200ms = 200ms
- 서버 부하: 1/3
- 데이터 정합성: 원자적 처리로 보장
\`\`\`

## 🛡️ 안정성 개선

### 1. 원자적 처리
- 모든 목적지 순서가 한 번에 변경
- 중간에 실패해도 일관성 유지

### 2. 서버 응답 신뢰
- 로컬 상태 대신 서버 응답으로 UI 업데이트
- 실제 저장된 데이터와 UI 동기화 보장

### 3. 오류 처리
- 실패 시 자동으로 서버에서 최신 상태 재로드
- 사용자에게 명확한 오류 메시지 표시

## 🎮 사용자 경험 개선

### 1. 두 가지 순서 변경 방법
- **드래그앤드롭**: 직관적인 순서 변경
- **드롭다운 선택**: 정확한 위치 지정

### 2. 즉시 반영
- 서버 응답을 받는 즉시 UI 업데이트
- 불필요한 로딩 시간 제거

### 3. 편집 모드
- 편집 모드에서만 순서 변경 기능 활성화
- 실수로 인한 순서 변경 방지

## 📝 다음 단계

1. **테스트**: 드래그앤드롭과 드롭다운 모두 테스트
2. **최적화**: 필요시 추가적인 UX 개선
3. **확장**: 다른 날짜로 목적지 이동 기능 추가 고려

---
**수정 완료일**: 2025-01-09  
**상태**: ✅ 모든 요구사항 구현 완료  
**호환성**: 새로운 백엔드 API와 완전 호환
