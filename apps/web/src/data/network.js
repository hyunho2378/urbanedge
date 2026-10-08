// network.js: Hwangnidan Line(H)이 어반엣지역(H01)으로 들어오고, 역 안에서 승강장 5개 노선이 갈라지는 노선도 데이터.
// 승강장 색: 1 노랑, 2 빨강, 3 파랑, 4 초록, 5 흰색. 실제 방 배치는 확인되지 않았으므로 노선도는 개념도다.
import { LINE, ROOMS, STATION } from './site.js'

export const NETWORK = {
  lines: [
    { id: LINE.id, color: LINE.color, name: LINE.name.en, code: LINE.code, stations: [{ id: STATION.id, label: STATION.name.en, code: STATION.code, x: 3, y: 4, interchange: true }] },
    ...ROOMS.map((r, i) => ({
      id: r.id,
      color: r.color,
      name: r.name,
      code: String(r.platform),
      stations: [
        { id: STATION.id, label: STATION.name.en, code: STATION.code, x: 3, y: 4, interchange: true },
        { id: r.id, label: r.title.en, code: String(r.platform), x: 10, y: 4 + (i - 2) * 2, labelDir: 'right' },
      ],
    })),
  ],
}
