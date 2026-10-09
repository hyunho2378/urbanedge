# UrbanEdge 운영 API (apps/server)

키오스크 3대와 운영 화면(카메라, POS, 쿠폰, 상품·가격, 대시보드)이 함께 쓰는 서버다.
Node 20, Express, Postgres. 결제, 상품, 프레임, 쿠폰, 카메라 설정, 매출 통계, 실시간 알림(SSE)을 맡는다.

실제 카드 단말기(VAN)와 연결하는 부분은 이 서버에 없다. 이 서버는 키오스크가 "결제가 끝났다"고 알려 주면 기록하고 집계한다.
단말기 연동 방법은 `docs/RESEARCH_OPS_INTEGRATION.md`에 정리했다.

## 환경 변수

| 이름 | 설명 |
| --- | --- |
| `DATABASE_URL` | Postgres 연결 주소(필수). Render DB를 만들면 자동으로 들어간다. |
| `DEVICE_KEY` | 키오스크가 결제와 촬영 기록을 쓸 때 보내는 키(`X-Device-Key`). 운영에서는 필수. |
| `ADMIN_KEY` | 상품, 쿠폰, 환불, 설정, 카메라, 지난 기록을 바꿀 때 보내는 키(`X-Admin-Key`). 운영에서는 필수. 기기 쓰기도 받는다. |
| `ALLOWED_ORIGINS` | 브라우저에서 접근을 허락할 주소들(쉼표로 구분). 기본값은 키오스크와 웹 Vercel 주소. localhost는 항상 허용. |
| `TZ` | `Asia/Seoul`. 통계의 오늘, 이번 주, 이번 달 경계가 한국 시간 기준이 된다. |
| `NODE_ENV` | `production`이면 키가 없을 때 쓰기를 모두 막는다(503). 개발에서는 키 없이도 쓸 수 있다. |
| `PORT` | Render가 넣어 준다. 로컬 기본값은 8787. |
| `PG_POOL_MAX` | 연결 수(기본 10). |
| `PGSSL` | `off`이면 SSL을 끈다(localhost에는 자동으로 꺼짐). |

읽기(GET)는 열려 있다. 키 값은 로그에 남기지 않는다.

## Render 설정

저장소 루트의 `render.yaml`(Blueprint)이 DB와 서버를 같이 만든다. 직접 만들 때는 다음 값을 쓴다.

- Root Directory: 비워 둔다(저장소 루트)
- Runtime: Node
- Build Command: `npm ci --workspace=@urbanedge/server --include-workspace-root=false`
- Start Command: `npm run start --workspace=@urbanedge/server`
- Health Check Path: `/api/health`
- 서버는 시작할 때 테이블을 만들고(여러 번 실행해도 안전), 상품 4개와 프레임 16개를 처음 한 번 채운다.

Render 무료 플랜의 제한(2026-10-09에 https://render.com/docs/free 에서 확인한 내용):

- 무료 Postgres는 워크스페이스마다 하나만 켤 수 있고, 저장 공간은 1GB, **만든 지 30일 뒤에 만료**된다. 만료 후 14일 안에 유료로 올리지 않으면 데이터가 삭제된다. 백업도 없다.
- 무료 웹 서비스는 15분 동안 요청이 없으면 잠들고, 다시 깨우는 데 1분쯤 걸린다. 월 750 인스턴스 시간이 주어진다.
- 그래서 운영에 쓰려면 DB를 유료로 올리거나 다른 Postgres(Neon, Supabase 등)의 연결 주소를 `DATABASE_URL`에 넣는다. 시연용으로는 무료로 충분하다.
- 키오스크 쪽은 서버에 닿지 않는 동안 결제 기록을 쌓아 두었다가 다시 보낸다(탭을 닫으면 사라진다).

## 키오스크 연결(Vercel)

키오스크 프로젝트(urbanedge-kiosk)의 환경 변수에 넣고 다시 배포한다.

```
VITE_API_URL=https://<서비스 주소>.onrender.com
VITE_DEVICE_KEY=<DEVICE_KEY 값>
VITE_ADMIN_KEY=<ADMIN_KEY 값>
```

Vite 환경 변수는 화면 코드에 그대로 들어간다. 시연 빌드용 방식이며, 실제 운영에서는 운영 화면에 로그인을 두고 관리자 키를 그 뒤에서만 내려받게 바꾼다.

## 주소(API)

쓰기 권한: 기기 = `X-Device-Key`, 관리자 = `X-Admin-Key`(기기 쓰기도 가능).

| 주소 | 권한 | 설명 |
| --- | --- | --- |
| `GET /api/health` | 열림 | 서버와 DB 확인 |
| `GET /api/state` | 열림 | 상품, 프레임, 쿠폰, 카메라 설정, 부스 상태, 가격 |
| `GET /api/stream` | 열림 | 실시간(SSE): tx, booth, file, camera, settings, history |
| `POST /api/tx` | 기기 | 결제 기록(같은 id로 다시 보내도 한 건만 남는다) |
| `PATCH /api/tx/:id` | 기기 | 컷 수, 프레임 붙이기 |
| `POST /api/tx/:id/refund` | 관리자 | 환불 |
| `GET /api/tx?from&to&booth&method&limit` | 열림 | 거래 목록(from, to는 밀리초 또는 날짜) |
| `GET /api/stats?range=today|week|month|year` | 열림 | 합계, 직전 기간 비교, 부스·상품·결제수단별, 시간·일·월 구간별(한국 시간) |
| `POST /api/history/backfill`, `DELETE /api/history` | 관리자 | 지난 기록 넣기, 지우기(origin='history') |
| `DELETE /api/sim` | 관리자 | 자동 운영으로 들어간 거래만 지우기 |
| `GET/POST/PATCH/DELETE /api/products` | 쓰기는 관리자 | 상품 |
| `PUT /api/price` | 관리자 | 기본 가격 |
| `PUT /api/frames/:id`, `POST /api/frames` | 관리자 | 프레임 켜기·끄기, 추가 |
| `GET/POST /api/coupons`, `POST /api/coupons/batch`, `PATCH /api/coupons/:code/toggle` | 쓰기는 관리자 | 쿠폰 |
| `POST /api/coupons/check`, `POST /api/coupons/redeem` | 기기 | 확인, 사용. 웹사이트 쿠폰(UE-, 체크섬)은 코드마다 한 번만 쓸 수 있다. |
| `PUT /api/camera/:booth` | 관리자 | 카메라 설정(범위를 넘는 값은 범위 안으로 맞춘다) |
| `PUT /api/booths/:id` | 기기 | 부스 상태(단계, 언어, 카메라) |
| `POST /api/files`, `GET /api/files` | 쓰기는 기기 | 저장 폴더 썸네일(부스마다 최근 60개, 40KB 이하) |
| `GET /api/settings/export`, `POST /api/settings/import` | 가져오기는 관리자 | 설정 파일 |

## 로컬에서 돌리기

```
export DATABASE_URL=postgres://사용자:비밀번호@localhost:5432/urbanedge
export DEVICE_KEY=devkey ADMIN_KEY=adminkey
npm run dev --workspace=@urbanedge/server            # http://localhost:8787
API_URL=http://localhost:8787 node apps/server/test/smoke.mjs   # 전체 시험
```

키오스크는 `apps/kiosk/.env.example`을 `.env.local`로 복사해 같은 값을 넣고 `npm run dev -w @urbanedge/kiosk`로 연다.

## 데이터

- 거래 `transactions`: `origin`이 `kiosk`(실제 흐름) 또는 `history`(지난 기록 넣기), `sim`은 자동 운영으로 들어간 것.
- 금액은 원 단위 정수. 환불하면 `status='refunded'`가 되고 매출 합계에서 빠진다.
- 시간은 UTC로 저장하고, 통계에서 한국 시간으로 자른다.
- 서버는 사진 원본을 저장하지 않는다. 저장 폴더에는 작은 썸네일만 부스마다 최근 60개 남긴다.
