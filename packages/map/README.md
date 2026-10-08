# @urbanedge/map

황리단길 지도 패키지. MapLibre GL(OpenFreeMap 벡터 타일) 위에 three.js 사용자 정의 레이어로 사전 가공한 OSM 건물을 압출하고, 어반엣지역(GY-01)을 노랑 신호탑으로 세운다.

```jsx
import { HwangnidanMap, GoogleMapEmbed, DirectionsLinks, directionsLinks, SHOP, LINE, STATION } from '@urbanedge/map'

<HwangnidanMap className="h-[70dvh]" lang="en" mode="3d" theme="dark" showRoute showConcept={false} onReady={(api) => api.showRouteFromMe()} />
<GoogleMapEmbed lang="en" zoom={17} />
<DirectionsLinks lang="en" />
```

## HwangnidanMap 프롭

| 프롭 | 기본값 | 설명 |
| --- | --- | --- |
| `mode` | `'3d'` | `'3d'` 또는 `'2d'`. 컨트롤 알약에서도 바꾼다(`onModeChange`로 알림) |
| `theme` | `'dark'` | `'dark'` 또는 `'light'`(`onThemeChange`) |
| `showRoute` | `true` | 황리단길 정류장에서 어반엣지역까지의 노란 도보 경로 |
| `showConcept` | `false` | 대릉원, 첨성대, 동궁과 월지를 "Concept stop(후보 역)"으로 흐리게 표시. 열린 부스가 아니다 |
| `lang` | `'en'` | `'en'` 또는 `'ko'`. 지도 라벨과 컨트롤 문구. 한영 전환에 레이아웃이 변하지 않는다 |
| `className` | `''` | 높이를 반드시 준다(예: `h-96`, `h-[70dvh]`). 기본은 4:3, 최소 20rem |
| `controls` | `true` | 2D 3D, 밝게 어둡게, 재중심, 확대 축소, 경로 설명, 내 위치 |
| `modeToggle` | `true` | 호스트가 2D 3D 전환을 따로 가지면 `false`로 둔다(안쪽 2D 3D 버튼을 숨긴다) |
| `themeToggle` | `true` | 호스트가 밝게 어둡게 전환을 따로 가지면 `false` |
| `lazy` | `true` | 화면 300px 앞에서 엔진(약 580KB gzip)을 불러온다 |
| `cooperative` | `true` | 두 손가락 이동, Ctrl(⌘)+스크롤 확대. 페이지 스크롤을 가로채지 않는다 |
| `forceRaster` | `false` | WebGL이 있어도 2D 래스터 지도를 쓴다(점검용) |
| `onReady(api)` | | `{ recenter, setMode, setTheme, showRouteFromMe, clearMyRoute, map, fallback }` |

`showRouteFromMe()`는 위치 허용을 요청하고 `{ status, kind, distanceM, durationS }`를 돌려준다. status는 `ok`, `denied`, `unavailable`, `timeout`, `unsupported`, `far`. 위치는 저장하지 않는다. 도보 경로를 그릴 때 출발 좌표(소수 4자리)가 routing.openstreetmap.de(OSRM)로 간다.

## 자료 굽기

`node packages/map/tools/bake-map.mjs`가 `apps/web/public/map/`에 `buildings.json`, `route.json`, `places.json`, `concept.json`을 만든다(Overpass와 OSRM, 런타임에는 부르지 않는다).
