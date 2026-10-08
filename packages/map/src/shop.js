// shop.js: 가게 좌표와 지도 공통 상수.
// 좌표 확정 근거(2026-10-09 확인)
//  1) Nominatim: "경북 경주시 포석로1079번길 6"은 번지 단위가 없고 도로 way 42433958(포석로1079번길)만 나온다. 도로 중심 35.83747, 129.20869.
//  2) Overpass: 이 도로에 addr:housenumber 노드가 없다. 도로 시작점은 포석로 쪽(동쪽 끝)이고 서쪽으로 뻗는다.
//     도로명주소 기초번호는 시작점에서 끝점 방향 오른쪽이 짝수(북쪽 변)이며 번호 6은 시작점에서 대략 60m 지점이다.
//  3) 네이버 플레이스(1432247982) 공개 페이지의 도로명주소가 "경북 경주시 포석로1079번길 6", 좌표가 129.2091941, 35.8375133이다.
//     이 좌표는 위 도로의 북쪽 변, 시작점에서 약 60m 지점에 있고 OSM 건물 way 1480372697 안쪽에 들어간다(건물 중심에서 2m).
//  결론: 35.83751, 129.20919(소수 5자리, 약 1m). 이전 자리표시 값(35.8346, 129.2108)은 남동쪽으로 약 330m 떨어져 있었다.
export const SHOP = {
  name: 'UrbanEdge Metrography',
  lat: 35.83751,
  lng: 129.20919,
  address: '경북 경주시 포석로1079번길 6',
  nameKo: '어반엣지',
}

// 서사(docs/NAMING.md 우선): 경주에는 지하철이 없고, 어반엣지가 만드는 가상의 "Gyeongju Metro"(코드 GY)가 있다.
// 지금 실제 역은 GY-01 UrbanEdge Station, Hwangridan-gil(어반엣지역, 황리단길) 하나뿐이다. 방(Subway, Karaoke, Public Phone, Retro)은 역 안 승강장 1에서 4이고 지도에는 나오지 않는다.
export const LINE = { id: 'gyeongju-metro', code: 'GY', name: 'Gyeongju Metro', nameKo: '경주 메트로' }
export const STATION = { code: 'GY-01', name: 'UrbanEdge', nameKo: '어반엣지', full: 'UrbanEdge Station, Hwangridan-gil', fullKo: '어반엣지역, 황리단길' }
export const NOTICE = { en: 'Imaginary Metro · Travel Experience', ko: '가상의 메트로 · 여행 경험' }

export const NAVER_PLACE_ID = '1432247982'
// 구워 둔 OSM 자료(apps/web/public/map). 런타임에 외부 API를 부르지 않는다. 생성은 packages/map/tools/bake-map.mjs
const BASE = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) || '/'
export const BAKED = { buildings: `${BASE}map/buildings.json`, route: `${BASE}map/route.json`, places: `${BASE}map/places.json`, concept: `${BASE}map/concept.json` }

// 지도에 이름을 올리는 OSM 장소. 전부 baked places.json에서 이름과 태그를 확인한 것이다(만든 이름 없음).
// node/368898357 연화불교전시관(tourism=museum), way/382249601 천마총(tourism=attraction), way/42435919 대릉원(tourism=attraction), node/13786652501 Street food street(tourism=attraction)
export const LABEL_PLACE_IDS = ['node/368898357', 'way/382249601', 'way/42435919', 'node/13786652501']
// 안내 목록에 쓰는 주변 장소(가게에서 가까운 순)
export const NEARBY_IDS = ['node/368898357', 'way/382249601', 'way/42435919']

// 가게 기준 평면 좌표(m). 동쪽 x, 북쪽 y. baked buildings.json과 같은 식이다(등장방형 근사, 반경 600m에서 충분).
const M_LAT = 111132.92
const M_LNG = 111412.84 * Math.cos((SHOP.lat * Math.PI) / 180) - 93.5 * Math.cos((3 * SHOP.lat * Math.PI) / 180)
export const toLocal = (lng, lat) => [(lng - SHOP.lng) * M_LNG, (lat - SHOP.lat) * M_LAT]

// 후보 역(Concept stop). 실제 부스 설치와 운영 협의가 확인되기 전까지는 후보로만 표시하고 열렸다고 말하지 않는다(NAMING.md).
// OSM way/42435919 대릉원, way/382132601 첨성대, way/477417220 경주 동궁과 월지. 이름과 좌표는 baked concept.json의 OSM 값.
export const CONCEPT_IDS = ['way/42435919', 'way/382132601', 'way/477417220']
