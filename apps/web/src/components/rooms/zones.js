// Untitled.obj (Rhino, mm). 좌표는 모델 단위(m)의 x, z 바닥 사각형 중심과 크기.
// 배치는 공간 투시도(public/img/space/urbanedge-space.jpg)와 같다.
export const CENTER = { x: -0.39509, z: -3.34323 }
export const ZONES = [
  { id: 'entrance', poly: '645,665 750,620 760,745 1145,725 1155,830 950,1025 630,835', no: '01', x: 4.33, z: -1.45, w: 3.6, d: 2.7, platform: null,
    title: { ko: '입구', en: 'Entrance' },
    desc: { ko: '유리문으로 들어온다. 맞은편 벽에 둥근 볼록거울 아홉 개가 붙어 있다.', en: 'Come in through the glass door. Nine round convex mirrors hang on the wall opposite.' } },
  { id: 'retro', poly: '50,342 240,228 318,268 292,442 140,398', no: '02', x: -6.15, z: -1.6, w: 1.6, d: 3.0, platform: 'retro',
    title: { ko: '레트로', en: 'Retro' },
    desc: { ko: '붉은 커튼과 나무 바닥만 있는 방이다.', en: 'Red curtain and a wooden floor, nothing else.' } },
  { id: 'karaoke', poly: '255,215 430,108 582,190 470,290 390,250 330,268', no: '03', x: -6.15, z: -4.93, w: 1.6, d: 3.2, platform: 'karaoke',
    title: { ko: '노래방', en: 'Karaoke' },
    desc: { ko: '붉은 타일 벽에 곡 목록, 하트 네온, 마이크가 있다.', en: 'Red tile walls, a song list, heart neon signs and a mic stand.' } },
  { id: 'subway', poly: '512,262 600,198 797,304 712,392 600,440 515,350', no: '04', x: -2.2, z: -5.68, w: 3.3, d: 1.7, platform: 'subway',
    title: { ko: '지하철', en: 'Subway' },
    desc: { ko: '뒷벽에 스테인리스 좌석이 있고, 앞쪽에 전동차 문 두 짝이 서 있다.', en: 'A stainless bench on the back wall and two train doors standing in front of it.' } },
  { id: 'front', poly: '318,385 505,262 515,345 545,520 525,560 325,470', no: '05', x: -2.2, z: -3.12, w: 3.3, d: 2.9, platform: null,
    title: { ko: '지하철 앞 공간', en: 'In front of Subway' },
    desc: { ko: '흰 타일 벽으로 둘러싸인 공간이다. 흰 카운터가 있다.', en: 'A white-tiled space with a white counter.' } },
  { id: 'hall', poly: '715,395 800,308 985,418 890,475 760,560 700,520', no: '06', x: 1.0, z: -3.3, w: 2.5, d: 6.3, platform: null,
    title: { ko: '대기 의자', en: 'Waiting seats' },
    desc: { ko: '노란 의자 네 개가 벽을 따라 놓인 가운데 통로다.', en: 'The middle aisle, with four yellow seats along the wall.' } },
  { id: 'mirror', poly: '880,505 990,418 1095,480 935,590 935,700 880,670', no: '07', x: 3.2, z: -3.5, w: 1.4, d: 1.0, platform: null,
    title: { ko: '전신거울', en: 'Full-length mirror' },
    desc: { ko: '둥근 모서리 벽 한 면이 전신거울이다.', en: 'The rounded wall is a full-length mirror.' } },
  { id: 'shutter', poly: '1100,482 1275,588 1155,715 1060,690 1095,600', no: '08', x: 5.1, z: -4.8, w: 2.0, d: 3.5, platform: null,
    title: { ko: '셔터 포토존', en: 'Shutter photo spot' },
    desc: { ko: '셔터에 노란 X 테이프와 고깔이 있다.', en: 'A shutter with yellow X tape and a cone.' } },
]
