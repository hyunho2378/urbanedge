// map/index.js: 지도 공개 API. 작업 G 구현.
//
// SHOP: { name, lat, lng, address, nameKo }                       가게 정보. 좌표는 Nominatim과 OSM으로 확정(근거는 shop.js 주석)
// HwangnidanMap({ mode, theme, showRoute, className, onReady, lang, controls, lazy, cooperative, onModeChange, onThemeChange, forceRaster })
//     MapLibre + three.js 3D 지도(황리단길 건물 압출, 노랑 신호탑, 황리단길선 H 도보 경로). mode: '3d'|'2d', theme: 'dark'|'light'. WebGL 실패 시 2D 래스터로 대체
// GoogleMapEmbed({ className, zoom, lang, title })                 구글 지도 임베드(VITE_GOOGLE_MAPS_KEY가 있으면 Embed API, 없으면 키 없는 임베드)
// directionsLinks({ lang, origin })                                { google, naver, kakao, naverPlace, items } 도보 길찾기 링크
// DirectionsLinks({ lang, className, stack, kakao })               위 링크를 버튼 줄로 그리는 컴포넌트
export { SHOP, LINE, STATION } from './shop.js'
export { HwangnidanMap } from './HwangnidanMap.jsx'
export { GoogleMapEmbed } from './GoogleMapEmbed.jsx'
export { DirectionsLinks } from './DirectionsLinks.jsx'
export { directionsLinks } from './links.js'
