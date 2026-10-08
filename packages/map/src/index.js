// map/index.js: 지도 계약. 작업 G(A4)가 실제 구현으로 교체한다.
//
// SHOP: { name, lat, lng, address }
// HwangnidanMap({ mode, theme, showRoute, className, onReady })   MapLibre + three.js 3D 지도(황리단길 건물 압출, 가게 핀, 도보 경로). mode: '3d'|'2d'
// GoogleMapEmbed({ className, zoom })                             구글 지도 임베드(환경변수 VITE_GOOGLE_MAPS_KEY가 있으면 Embed API, 없으면 키 없는 임베드)
export const SHOP = { name: 'UrbanEdge Metrography', lat: 35.8346, lng: 129.2108, address: '경북 경주시 포석로1079번길 6' }
export function HwangnidanMap() { return null }
export function GoogleMapEmbed() { return null }
