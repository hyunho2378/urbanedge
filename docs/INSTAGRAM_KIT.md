# INSTAGRAM_KIT.md

@__urbanedge 게시 계획이다. 이미지는 `apps/web/public/img/social/feed/`(피드, 4:5, 1080x1350)에 있고, 파일별 설명과 캡션 파일 경로는 같은 폴더의 `index.json`에 있다. 하이라이트 커버(1:1, 1080x1080)는 다른 작업(SOC-A)이 `apps/web/public/img/social/highlights/`에 만든다. 이 문서는 하이라이트의 구성과 이름만 제안하고 실제 커버 이미지는 다루지 않는다. 문체는 `docs/VOICE.md`를 따랐다: 영어를 먼저 새로 쓰고, 한국어는 번역이 아니라 명사형 두괄식으로 따로 썼다. 게시 시간대는 근거가 없어 쓰지 않았다.

## 고정(핀) 3개

Instagram은 고정 게시물을 그리드 맨 위 왼쪽부터 순서대로 보여준다(게시 날짜와 무관). 사용자가 프로필에 처음 들어왔을 때 가장 먼저 풀어야 할 질문 3개를 골랐다.

| 순서 | 게시물 | 이유 |
| --- | --- | --- |
| 1 | `01-howto-cover.jpg`로 시작하는 캐러셀(`01`~`07`, "How to ride UrbanEdge") | 방문 전 가장 큰 질문은 "이게 뭐고 어떻게 쓰는가"다. 다섯 정거장(FIND, CHOOSE, PAY, POSE, PRINT)짜리 캐러셀이라 핀에 가장 적합하다. 표지를 "4 stops"에서 실제 정거장 수와 맞는 "5 stops. No ticket needed."로 고쳤다. |
| 2 | `18-faq.jpg`("How do I pay?") | 결제 수단(카드, 삼성페이, 현금, 쿠폰)은 현장에서 가장 자주 받는 질문이고 망설임 없이 결제하게 만든다. |
| 3 | `10-ticket.jpg`("7,000 KRW. Two prints included.") | 가격은 방문 결정을 가르는 정보다. 이용법과 결제 수단 바로 다음에 보여야 망설임이 줄어든다. |

## 하이라이트 구성(이름 제안, 커버는 SOC-A 제작)

| 이름 | 영문 이름 | 담을 내용 |
| --- | --- | --- |
| How to | How to | 캐러셀 `01`~`07` 7장. 입구 찾기부터 인화까지. |
| Platform 1 · Subway | Platform 1 | `11-pose-subway.jpg`와 추후 추가될 현장 사진. 노랑 라인. |
| Platform 2 · Karaoke | Platform 2 | `12-pose-karaoke.jpg`와 현장 사진. 빨강 라인. |
| Platform 3 · Phone | Platform 3 | `13-pose-phone.jpg`와 현장 사진. 파랑 라인. |
| Platform 4 · Retro | Platform 4 | `14-pose-retro.jpg`와 현장 사진. 초록 라인. |
| Visit | Visit | `09-hours.jpg`, `10-ticket.jpg`, `18-faq.jpg`, 위치 정보(주소, 네이버 플레이스 링크). |

승강장 4개를 각각 하이라이트로 나눈 이유는 어반엣지의 핵심 선택지(4개 승강장 중 어디를 고를지)를 프로필에서 바로 보여주기 위해서다. 이름은 `docs/NAMING.md`의 용어(Platform, Station)를 그대로 썼고 "카라오케역" 같은 방 이름 역은 쓰지 않았다.

## 그리드 배치(첫 12칸)

Instagram 그리드는 최신 게시물이 핀 다음 왼쪽 위부터 채워진다. 아래는 핀 3개를 뺀 나머지 9개를 포함해 첫 12칸이 이렇게 보이도록 짠 순서다. 검정 배경과 노랑 배경을 번갈아 두고, 글자 중심 게시물과 일러스트 중심 게시물을 섞었으며, 승강장 4색(노랑·빨강·파랑·초록)이 그리드 안에서 서로 붙지 않게 배치했다.

| 칸 | 파일 | 유형 |
| --- | --- | --- |
| 1 (핀) | `01-howto-cover.jpg` | 일러스트 중심, 노랑/검정 |
| 2 (핀) | `18-faq.jpg` | 텍스트+아이콘, 노랑 |
| 3 (핀) | `10-ticket.jpg` | 텍스트+오브젝트, 검정 |
| 4 | `08-welcome.jpg` | 텍스트 중심, 검정 |
| 5 | `11-pose-subway.jpg` | 일러스트, 노랑 승강장 |
| 6 | `17-metro-pass.jpg` | 텍스트+다이어그램, 검정 |
| 7 | `12-pose-karaoke.jpg` | 일러스트, 빨강 승강장 |
| 8 | `09-hours.jpg` | 텍스트 중심, 노랑 |
| 9 | `13-pose-phone.jpg` | 일러스트, 파랑 승강장 |
| 10 | `20-disclaimer.jpg` | 텍스트 중심, 검정 |
| 11 | `14-pose-retro.jpg` | 일러스트, 초록 승강장 |
| 12 | `16-frames.jpg` | 실사 합성(프레임 목업), 검정 |

게시 순서: 핀 3개(`01`, `18`, `10`)를 먼저 올리고 고정한다. 나머지는 위 표의 12번부터 4번까지 역순으로(큰 번호를 먼저, 작은 번호를 나중에) 올리면, 올린 날짜가 최신일수록 위로 올라오는 Instagram 규칙에 따라 표의 1~12 순서 그대로 그리드에 보인다. `15-lens-tip.jpg`와 `19-share-coupon.jpg`는 그리드 순번을 지정하지 않았으므로 12칸 이후 아무 때나 자유롭게 올리면 된다.

## 게시물별 캡션과 해시태그

해시태그는 모든 게시물에 같은 세트를 썼다: 브랜드 태그(`#UrbanEdge #UrbanEdgeMetrography #어반엣지 #GyeongjuMetro`)와 경주 태그(`#Gyeongju #경주 #경주여행 #황리단길 #HwangridanGil #경주포토부스`)뿐이며, 확인되지 않은 숫자(방문자 수, 후기 수 등)로 만든 태그는 쓰지 않았다.

### 1. How to ride UrbanEdge (캐러셀, 핀 1)
파일: `01-howto-cover.jpg` ~ `07-howto-share.jpg`

- EN: How to ride UrbanEdge, in five stops. Find the checkerboard entrance, choose your platform, pay by card, cash, or coupon, pose for four or eight cuts, then collect your prints at the slot. Swipe through all seven slides before you come.
- KO: 어반엣지 이용법을 다섯 정거장으로 정리했다. 체커보드 입구를 찾고 승강장을 고른 뒤 카드와 현금, 쿠폰 중 하나로 결제하고 포즈를 취한 다음 슬롯에서 인화물을 받는다. 방문 전에 일곱 장을 모두 넘겨 보면 된다.

### 2. How do I pay? (핀 2)
파일: `18-faq.jpg`

- EN: How do I pay? Card, cash, coupon, or Samsung Pay at the terminal, whichever is already in your pocket.
- KO: 결제 수단을 묻는 질문이 가장 많다. 카드와 현금, 쿠폰, 단말기의 삼성페이까지 모두 가능하다.

### 3. 7,000 KRW. Two prints included. (핀 3)
파일: `10-ticket.jpg`

- EN: Base fare is 7,000 KRW. Two prints come with every ride, so there is no separate charge for the second copy.
- KO: 기본 요금은 7,000원이다. 인화 두 장이 포함되어 있어 추가 요금 없이 그대로 가져가면 된다.

### 4. Welcome / brand statement
파일: `08-welcome.jpg`

- EN: Gyeongju has no subway. So we built one stop: UrbanEdge Station, GY-01, right on Hwangridan-gil.
- KO: 경주에는 지하철이 없다. 그 대신 황리단길 한 곳에 정거장 하나, GY-01 어반엣지역을 만들었다.

### 5. Platform 1 · Subway Shot pose
파일: `11-pose-subway.jpg`

- EN: Platform 1, Subway Shot. Hold the overhead strap, look out the window, and let the steel doors do the rest.
- KO: 1번 승강장은 지하철 샷이다. 손잡이 줄을 잡고 창밖을 보면 스테인리스 문이 나머지를 완성해 준다.

### 6. Metro Pass explainer
파일: `17-metro-pass.jpg`

- EN: Collect stations, stamp your pass. One Metro Pass tracks all four platforms from a single visit.
- KO: 정거장을 모아 메트로 패스에 도장을 찍는다. 패스 하나로 네 승강장 방문을 한 번에 기록한다.

### 7. Platform 2 · Karaoke Shot pose
파일: `12-pose-karaoke.jpg`

- EN: Platform 2, Karaoke Shot. Grab a prop from the pegboard and sing one verse to the mic, backup singers welcome.
- KO: 2번 승강장은 노래방 샷이다. 페그보드에서 소품을 하나 골라 마이크에 한 소절만 불러도 충분하다.

### 8. Opening hours
파일: `09-hours.jpg`

- EN: First train 10:00, last train 24:00. The station runs every day, so there is no schedule to check before you come.
- KO: 첫차는 10시, 막차는 자정이다. 매일 운영하는 정거장이라 요일을 따로 확인할 필요가 없다.

### 9. Platform 3 · Public Phone Shot pose
파일: `13-pose-phone.jpg`

- EN: Platform 3, Public Phone Shot. Answer the call on the mirror screen and press green, the camera is already rolling.
- KO: 3번 승강장은 공중전화 샷이다. 거울 화면 속 전화를 받듯 초록 버튼을 누르면 카메라가 그 순간을 담는다.

### 10. Imaginary Metro disclaimer / brand post
파일: `20-disclaimer.jpg`

- EN: A quick note from the platform: Gyeongju Metro is an imaginary travel experience built inside one real photo studio.
- KO: 승강장에서 전하는 안내다. 경주 메트로는 실제 어반엣지 사진관 안에 만든 가상의 지하철 여행 경험이다.

### 11. Platform 4 · Retro Shot pose
파일: `14-pose-retro.jpg`

- EN: Platform 4, Retro Shot. Sit close on the two wooden stools and look straight at the lens behind the curtain.
- KO: 4번 승강장은 레트로 샷이다. 나무 의자 두 개에 바싹 붙어 앉아 커튼 뒤 렌즈를 정면으로 보면 된다.

### 12. Four cuts or eight? Pick your frame
파일: `16-frames.jpg`

- EN: Four cuts or eight? Pick your frame before the countdown starts, both come out of the same slot.
- KO: 4컷과 8컷 중에서 고른다. 촬영 전에 프레임을 정하면 되고 두 가지 모두 같은 슬롯에서 나온다.

### 13. Mind the lens
파일: `15-lens-tip.jpg` (그리드 순번 미지정, 자유 게시)

- EN: Mind the lens. It sits below the screen, not behind it, so look down at the small circle, not at your own face.
- KO: 렌즈 위치를 먼저 확인한다. 화면이 아니라 화면 아래 작은 원 안에 렌즈가 있어서 그곳을 봐야 한다.

### 14. Share it. Scratch it. (쿠폰 리마인더 변형)
파일: `19-share-coupon.jpg` (그리드 순번 미지정, 자유 게시)

- EN: Share it, scratch it. Tag @__urbanedge after your visit and open a scratch coupon on the spot.
- KO: 공유하고 긁는다. 방문 후 @__urbanedge를 태그하면 스크래치 쿠폰이 그 자리에서 열린다.

## 공통 해시태그

```
#UrbanEdge #UrbanEdgeMetrography #어반엣지 #GyeongjuMetro #Gyeongju #경주 #경주여행 #황리단길 #HwangridanGil #경주포토부스
```
