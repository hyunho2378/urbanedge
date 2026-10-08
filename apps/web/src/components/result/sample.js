// sample.js: 결과 페이지의 데모 세션 데이터.
// 업로드 서버와 저장소는 아직 없다. 결과 페이지는 사이트에 이미 들어 있는 어반엣지 인화물 샘플 이미지 3장과
// 사용자가 제공한 MP4 1개(apps/web/public/media/result/demo-video.mp4, 10,784,616 bytes)를 그대로 보여 준다.
// 실제 촬영본을 연결하는 시점에는 getResultSession()만 서버 조회로 바꾸면 된다.

export const SAMPLE_SESSION = {
  id: 'demo',
  date: '2026.10.09',
  station: 'GY-01 UrbanEdge',
  platform: { en: 'Platform 2 Karaoke Shot', ko: '2번 승강장 카라오케 샷' },
  photos: [
    {
      id: 'signature',
      src: '/img/frames/signature.jpg',
      file: 'urbanedge-photo-1.jpg',
      width: 1200,
      height: 1800,
      alt: { en: 'Signature Cut print: four small shots and one large shot', ko: '시그니처 컷 인화물: 작은 4컷과 큰 1컷' },
    },
    {
      id: 'layer',
      src: '/img/frames/layer.jpg',
      file: 'urbanedge-photo-2.jpg',
      width: 1200,
      height: 1800,
      alt: { en: 'Layer Cut print on a black background with yellow tape', ko: '검정 바탕에 노란 테이프가 붙은 레이어 컷 인화물' },
    },
    {
      id: 'classic-black',
      src: '/img/frames/classic-black.jpg',
      file: 'urbanedge-photo-3.jpg',
      width: 1200,
      height: 1800,
      alt: { en: 'Classic Black print with four cuts', ko: '4컷 클래식 블랙 인화물' },
    },
  ],
  video: {
    src: '/media/result/demo-video.mp4',
    file: 'urbanedge-video.mp4',
    bytes: 10784616,
  },
}

// 어떤 세션 id가 와도 샘플 세션을 돌려준다. 그래서 QR의 세션 주소가 404가 되지 않는다.
// 화면에는 항상 샘플이라는 표시를 붙인다(isSample).
export function getResultSession(sessionId) {
  return { ...SAMPLE_SESSION, requestedId: sessionId, isSample: true }
}

export const formatMB = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`
