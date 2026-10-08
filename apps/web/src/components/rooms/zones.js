// Untitled.obj: Rhino model, units mm, origin kept from source. Material groups do not name rooms.
// These are architectural footprints, not an assignment of the four branded photo platforms.
export const CENTER = { x: -0.39509, z: -3.34323 }
export const ZONES = [
  { id: 'glass', no: '01', x: 4.3, z: -0.92, w: 3.3, d: 1.32, title: { ko: '유리 전면', en: 'Glazed frontage' }, desc: { ko: '길게 이어지는 유리벽이다. 모델의 앞쪽 방향을 확인할 수 있다.', en: 'A long glass wall marks the front edge of the architectural model.' } },
  { id: 'west', no: '02', x: -6.0, z: -3.5, w: 1.5, d: 5.85, title: { ko: '왼쪽 구획', en: 'West bays' }, desc: { ko: '짧은 가로벽으로 나뉜 작은 구획 두 곳이 외벽 안쪽에 있다.', en: 'Two smaller bays sit beside the outer wall, divided by a short cross-wall.' } },
  { id: 'inner', no: '03', x: -2.25, z: -4.2, w: 2.7, d: 4.45, title: { ko: '안쪽 구획', en: 'Inner bay' }, desc: { ko: '가운데 왼쪽에 벽으로 둘러싸인 구획이 있다. 열린 틈으로 바깥 공간과 이어진다.', en: 'An enclosed bay occupies the middle-left, with an opening toward the wider floor.' } },
  { id: 'center', no: '04', x: 0.94, z: -4.2, w: 2.3, d: 4.45, title: { ko: '중앙 공간', en: 'Open center' }, desc: { ko: '넓게 열린 바닥이 양쪽 구획 사이를 연결한다.', en: 'A broad open area connects the enclosed bays on either side.' } },
  { id: 'east', no: '05', x: 5, z: -4.65, w: 2.03, d: 3.3, title: { ko: '오른쪽 구획', en: 'East bay' }, desc: { ko: '유리 면 가까이 휘어진 칸막이 옆의 구획이다.', en: 'A separate bay sits beside a curved partition near the glazed edge.' } },
]

// No reliable position-to-platform mapping exists in the supplied, unlabelled OBJ.
// Fill only after a dimensionally matching, labelled plan is confirmed.
export const ZONE_PLATFORM = { glass: null, west: null, inner: null, center: null, east: null }
