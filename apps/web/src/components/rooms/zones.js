// Untitled.obj: Rhino model, units mm, origin kept from source. Material groups do not name rooms.
// These are architectural footprints, not an assignment of the four branded photo platforms.
export const CENTER = { x: -0.39509, z: -3.34323 }
export const ZONES = [
  { id: 'glass', no: '01', x: 4.3, z: -0.92, w: 3.3, d: 1.32, title: { ko: '입구', en: 'Entrance' }, desc: { ko: '길가 쪽 유리벽과 입구다.', en: 'The glass front and the door from the street.' } },
  { id: 'west', no: '02', x: -6.0, z: -3.5, w: 1.5, d: 5.85, title: { ko: '레트로 · 노래방', en: 'Retro and Karaoke' }, desc: { ko: '벽 하나를 사이에 둔 레트로 방과 노래방이다.', en: 'The Retro room and the Karaoke room, side by side.' } },
  { id: 'inner', no: '03', x: -2.25, z: -4.2, w: 2.7, d: 4.45, title: { ko: '안쪽 방', en: 'Inner room' }, desc: { ko: '벽으로 둘러싸인 방이다. 한쪽이 열려 있다.', en: 'A walled room with one open side.' } },
  { id: 'center', no: '04', x: 0.94, z: -4.2, w: 2.3, d: 4.45, title: { ko: '가운데 통로', en: 'Center aisle' }, desc: { ko: '방과 방 사이를 잇는 바닥이다.', en: 'The open floor between the rooms.' } },
  { id: 'east', no: '05', x: 5, z: -4.65, w: 2.03, d: 3.3, title: { ko: '포토존', en: 'Photo zone' }, desc: { ko: '전신거울 옆, 셔터와 고깔이 있는 포토존이다.', en: 'The shutter and cone corner next to the full-length mirror.' } },
]

// No reliable position-to-platform mapping exists in the supplied, unlabelled OBJ.
// Fill only after a dimensionally matching, labelled plan is confirmed.
export const ZONE_PLATFORM = { glass: null, west: null, inner: null, center: null, east: null }
