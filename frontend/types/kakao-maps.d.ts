// 카카오맵 API 타입 정의
declare global {
  interface Window {
    kakao: {
      maps: {
        Map: new (container: HTMLElement, options: MapOptions) => Map
        LatLng: new (lat: number, lng: number) => LatLng
        LatLngBounds: new () => LatLngBounds
        Marker: new (options: MarkerOptions) => Marker
        MarkerImage: new (src: string, size: Size, options?: MarkerImageOptions) => MarkerImage
        InfoWindow: new (options: InfoWindowOptions) => InfoWindow
        Size: new (width: number, height: number) => Size
        Point: new (x: number, y: number) => Point
        event: {
          addListener: (target: any, eventType: string, handler: () => void) => void
          removeListener: (target: any, eventType: string, handler: () => void) => void
        }
        services: {
          Geocoder: new () => Geocoder
        }
        MapTypeId: {
          ROADMAP: string
          SKYVIEW: string
          HYBRID: string
          OVERLAY: string
          ROADVIEW: string
          TRAFFIC: string
          BICYCLE: string
          BICYCLE_HYBRID: string
        }
        ControlPosition: {
          TOP: string
          TOPLEFT: string
          TOPRIGHT: string
          LEFT: string
          RIGHT: string
          BOTTOMLEFT: string
          BOTTOM: string
          BOTTOMRIGHT: string
        }
      }
    }
  }
}

interface MapOptions {
  center: LatLng
  level: number
  mapTypeId?: string
  draggable?: boolean
  scrollwheel?: boolean
  disableDoubleClick?: boolean
  disableDoubleClickZoom?: boolean
  projectionId?: string
  tileAnimation?: boolean
  keyboardShortcuts?: boolean
}

interface Map {
  setCenter: (latlng: LatLng) => void
  setLevel: (level: number) => void
  getLevel: () => number
  panTo: (latlng: LatLng) => void
  setBounds: (bounds: LatLngBounds) => void
  setMapTypeId: (mapTypeId: string) => void
  addOverlayMapTypeId: (mapTypeId: string) => void
  removeOverlayMapTypeId: (mapTypeId: string) => void
  getBounds: () => LatLngBounds
  getCenter: () => LatLng
  setDraggable: (draggable: boolean) => void
  setZoomable: (zoomable: boolean) => void
}

interface LatLng {
  getLat: () => number
  getLng: () => number
}

interface LatLngBounds {
  extend: (latlng: LatLng) => void
  isEmpty: () => boolean
  toString: () => string
  contain: (latlng: LatLng) => boolean
  equals: (bounds: LatLngBounds) => boolean
}

interface MarkerOptions {
  position: LatLng
  image?: MarkerImage
  title?: string
  draggable?: boolean
  clickable?: boolean
  zIndex?: number
  opacity?: number
}

interface Marker {
  setMap: (map: Map | null) => void
  getMap: () => Map
  setPosition: (position: LatLng) => void
  getPosition: () => LatLng
  setImage: (image: MarkerImage) => void
  setTitle: (title: string) => void
  getTitle: () => string
  setDraggable: (draggable: boolean) => void
  getDraggable: () => boolean
  setClickable: (clickable: boolean) => void
  getClickable: () => boolean
  setZIndex: (zIndex: number) => void
  getZIndex: () => number
  setOpacity: (opacity: number) => void
  getOpacity: () => number
}

interface MarkerImageOptions {
  offset?: Point
  alt?: string
  shape?: string
  coords?: string
  spriteOrigin?: Point
  spriteSize?: Size
}

interface MarkerImage {
  getSrc: () => string
  getSize: () => Size
  getOffset: () => Point
}

interface InfoWindowOptions {
  content: string
  removable?: boolean
  position?: LatLng
  zIndex?: number
}

interface InfoWindow {
  open: (map: Map, marker?: Marker) => void
  close: () => void
  setContent: (content: string) => void
  getContent: () => string
  setPosition: (position: LatLng) => void
  getPosition: () => LatLng
  setZIndex: (zIndex: number) => void
  getZIndex: () => number
}

interface Size {
  getWidth: () => number
  getHeight: () => number
}

interface Point {
  getX: () => number
  getY: () => number
}

interface Geocoder {
  addressSearch: (address: string, callback: (result: any[], status: string) => void) => void
  coord2Address: (lng: number, lat: number, callback: (result: any[], status: string) => void) => void
}

export {}
