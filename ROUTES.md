# ROUTES.md

| 앱 | 경로 | 컴포넌트 | 소유 |
| --- | --- | --- | --- |
| web | `/` | `pages/Home.jsx` | W1 |
| web | `/rooms` | `pages/Rooms.jsx` | W2 |
| web | `/rooms/:id` | `pages/RoomDetail.jsx` | W2 |
| web | `/guide` | `pages/Guide.jsx` | W2 |
| web | `/visit` | `pages/Visit.jsx` | W2 |
| web | `/gallery` | `pages/Gallery.jsx` | W2 |
| web | `*` | `pages/NotFound.jsx` | W2 |
| kiosk | `/` | `pages/Simulator.jsx` | K1 |
| kiosk | `/screen` | `pages/ScreenOnly.jsx` | K1 |

SPA 새로고침 404를 막기 위해 앱마다 `vercel.json`에 rewrites가 있다.
