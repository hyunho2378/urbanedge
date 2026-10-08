# SOCIAL_BRIEF.md

사장님이 인스타그램(@__urbanedge)에 올릴 이미지 세트를 GPT 이미지(imagegen)로 만든다. 브랜드를 해치지 않고, 텍스트 이미지와 일러스트 이미지를 섞고, 사용 방법 게시물은 고정(핀)하기 좋게, 하이라이트 커버까지 만든다.

## 스타일 앵커(반드시 참조 이미지로 넘긴다)

`docs/reference/social-anchors/`: `ig-s1-cover.jpg`부터 `ig-s7-share.jpg`까지 7장은 이미 승인된 사용 방법 캐러셀이다. 검정 #0A0A0A, 신호 노랑 #F5C518, 흰색, 두꺼운 기하 산세리프 헤드라인, 서울 지하철 안내 표지 언어(원형 노선 배지 GY, 역명 알약, 점선 노선과 정거장), 타일 승강장, 납작한 벡터 일러스트, 사람 없음, 노이즈 없음. `poster-p1-subway.jpg`, `poster-p2-karaoke.jpg`는 승강장 포스터 앵커(단, 배지는 H가 아니라 GY, 역 안내판은 "GY-01 UrbanEdge"로 새로 만든다).

## 서사와 이름(`docs/NAMING.md`가 기준)

Gyeongju Metro, Powered by UrbanEdge. 경주에는 지하철이 없다. 어반엣지는 가상의 지하철 관광 경험의 첫 역 GY-01 UrbanEdge(어반엣지, 황리단길)다. 방은 승강장이다: Platform 1 Subway Shot(노랑), 2 Karaoke Shot(빨강), 3 Public Phone Shot(파랑), 4 Retro Shot(초록). 화장실 방은 없다. 역 이름은 항상 UrbanEdge이고 "카라오케역" 같은 방 이름 역은 금지다. 슬로건: Beyond the Lens, Into the Streets / EVERY SHOT IS A JOURNEY / Explore Gyeongju, One Station at a Time. 허구 고지: Imaginary Metro · Travel Experience(이미지 안에 작게 넣어도 된다).

## 사실(만들지 않는다)

주소 경북 경주시 포석로1079번길 6. 영업 10:00부터 24:00까지. 기본 7,000원에 인화 2장. 4컷과 8컷. 카메라는 화면 아래에 있다. 결제는 카드(삼성페이 포함), 현금, 쿠폰. 사이트에서 인스타그램 공유 후 스크래치 쿠폰을 받는다. 인스타그램 @__urbanedge, 네이버 플레이스 https://m.place.naver.com/place/1432247982. 이 밖의 가격과 시간, 후기 수는 쓰지 않는다. 이미지 안의 글자는 짧게, 철자를 정확히 지정한다. 상표 문제를 피하려고 서울 지하철 로고, S 로고, 코레일 마크를 그리지 않는다. 열차에는 블록형 UE 마크와 UrbanEdge만 쓴다(UE 마크 참조: `packages/brand/assets/ue-mark.svg`).

## 산출물 위치와 규격

피드 게시물 4:5(생성 후 1080x1350으로 저장)는 `apps/web/public/img/social/feed/`, 하이라이트 커버 1:1(1080x1080, 원형으로 잘려도 중심이 안전해야 함)은 `apps/web/public/img/social/highlights/`, 승강장 포스터 2:3은 `apps/web/public/img/posters/`(QR을 넣을 흰 둥근 사각형 자리를 오른쪽 아래에 비워 둔다. 배포 주소가 정해지면 QR을 합성한다), 스토리 9:16은 `apps/web/public/img/social/story/`. 파일은 JPG(품질 88) 또는 PNG이며 이름은 `NN-slug.jpg`. 각 폴더에 `index.json`(파일, 제목, 한 줄 설명, 용도)을 둔다.
imagegen은 호출당 60초 안팎이 걸리고 REPL 호출은 120초에서 끊긴다. 한 호출에 이미지 한 장만 요청하고, 실패하면 단순한 프롬프트로 한 번 더 시도한다. 생성이 취소되면 다음 호출에서 다시 한다. 결과 PNG는 보고 확인한 뒤(contact sheet로 여러 장을 한 번에 점검) 글자 철자와 로고 오류가 있으면 다시 만든다.

## 게시 키트 문서

`docs/INSTAGRAM_KIT.md`에 사장님용 게시 계획을 쓴다: 고정(핀) 3개의 순서와 이유, 하이라이트 구성과 이름, 그리드 배치 순서, 게시물별 캡션(영어 먼저 네이티브로, 한국어는 따로 명사형 두괄식으로, 나열식 금지)과 해시태그, 게시 시간대 제안은 근거가 없으므로 쓰지 않는다. 문체 규칙은 `docs/VOICE.md`.
