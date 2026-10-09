# NAMING.md

최신 네이밍과 서사. 이전 추가 지시와 충돌하면 이 문서가 우선한다(10월 9일 새벽 기준). 팀 기획안 원문은 `docs/GYEONGJU_METRO.md`에 있다.

## 서사

경주에는 지하철이 없다. 어반엣지는 "Gyeongju Metro, Powered by UrbanEdge"라는 가상의 지하철 관광 경험을 만든다. 어반엣지 포토부스가 있는 곳마다 역(Station)이라는 정체성을 부여하고, 가상 노선도와 모바일 웹, 현장 QR, 방문 수집(Metro Pass)으로 사진 촬영을 경주 탐험의 일부로 바꾼다. 핵심 메시지는 "Explore Gyeongju, One Station at a Time."이다. 이 서사는 브랜드가 만든 가상의 이야기이며 실제 교통시설이나 공식 역이 아니다. 화면에는 "Imaginary Metro · Travel Experience" 고지를 둔다.

## 용어

| 항목 | 영문 | 한글 | 코드 |
| --- | --- | --- | --- |
| 시스템 | Gyeongju Metro | 경주 메트로 | GY |
| 첫 역(실제 부스) | UrbanEdge Station, Hwangridan-gil | 어반엣지역, 황리단길 | GY-01 |
| 승강장 1 | Platform 1, Retro Shot (1968 · The Roots) | 1번 승강장, 레트로 샷 (1968 · 뿌리) | 1 |
| 승강장 2 | Platform 2, Karaoke Shot (2008 · The Memory) | 2번 승강장, 노래방 샷 (2008 · 추억) | 2 |
| 승강장 3 | Platform 3, Subway Shot (2000s · The Present) | 3번 승강장, 지하철 샷 (2000년대 · 현재) | 3 |
| 출구 | Exit 1 | 1번 출구 | |
| 승차권 | Metro Ticket | 승차권 | |
| 수집 | Metro Pass | 메트로 패스 | |
| 완료 카드 | Journey Complete | 여정 완료 | |

방(Toilet 포함)이 아니라 역이 이름이 된다. 역 안내판은 항상 "GY-01 UrbanEdge / 어반엣지"이며 방 이름은 승강장 태그로 붙는다("카라오케역" 같은 방 이름 역 금지). 화장실 방은 더 이상 없다. 승강장 번호는 시간 순서(1 Retro, 2 Karaoke, 3 Subway)다. 승강장 강조색은 방마다 고정이다: 초록(Retro), 빨강(Karaoke), 노랑(Subway). 공중전화 방(파랑)은 없어졌다. 방 id(retro, karaoke, subway)와 URL은 번호와 무관하게 그대로다.

## 후보 역(컨셉 설명용)

황리단길 외에 대릉원, 첨성대, 동궁과 월지를 후보 관광지로 쓸 수 있다. 실제 부스 설치와 운영 협의가 확인되기 전에는 "Concept stop(후보)"로만 표시하고 열렸다고 말하지 않는다. 코드는 GY-02부터 임시로 붙인다. 운영시간, 거리, 도보 시간은 확인된 데이터만 보여 준다.

## 기능 우선순위(기획안 06)

P0: 노선도, 역 상세, 현장 QR 체크인(`/check-in/gy-01`), Metro Pass. P1: 영어와 한국어 전환, 길찾기, 방문 진행률. P2: 공유 이미지(Journey Complete), 다음 역 추천. 방문 기록은 브라우저 저장소 대신 쿠키(`ue_pass`, 개인정보 없음)에 담는다. 쿠키로도 부정 체크인을 완전히 막을 수 없다는 한계를 화면 밖 문서에 적는다.
