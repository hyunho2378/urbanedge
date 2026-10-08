// copy.js: 결과 페이지 문구. 모든 문구는 { en, ko }로 둔다.
export const COPY = {
  brandLabel: { en: 'Result', ko: '촬영 결과' },
  title: { en: 'Photos and video', ko: '사진과 영상' },
  sample: { en: 'Sample', ko: '샘플' },
  sampleNote: { en: 'Sample photos and video from the UrbanEdge studio.', ko: '어반엣지 스튜디오의 샘플 사진과 영상이다.' },
  savePhoto: { en: 'Save photo', ko: '사진 저장' },
  saveVideo: { en: 'Save video', ko: '영상 저장' },
  photoSection: { en: 'Photos', ko: '사진' },
  videoSection: { en: 'Video', ko: '영상' },
  photoSectionNum: '01',
  videoSectionNum: '02',
  photoHint: { en: 'Swipe to see every print. The save button follows the photo on screen.', ko: '좌우로 넘겨 인화물을 본다. 저장 버튼은 화면에 보이는 사진을 저장한다.' },
  videoHint: { en: 'Tap play to watch. Save keeps the original MP4.', ko: '재생을 눌러 본다. 저장하면 원본 MP4를 받는다.' },
  tip: {
    en: 'On iPhone, saved files go to Downloads in the Files app. To add a photo to Photos, press and hold the image and choose Add to Photos.',
    ko: '아이폰은 저장한 파일이 파일 앱의 다운로드 폴더에 들어간다. 사진 앱에 넣으려면 이미지를 길게 눌러 사진에 추가한다.',
  },
  about: { en: 'About UrbanEdge', ko: '어반엣지 소개' },
  videoFallback: { en: 'This browser cannot play the video. Use the save button to download it.', ko: '이 브라우저에서는 영상을 재생할 수 없다. 저장 버튼으로 내려받는다.' },
  langLabel: { en: 'Language', ko: '언어' },
  carouselLabel: { en: 'Photo prints', ko: '사진 인화물' },
}

export const countLine = (n) => ({
  en: `${n} photos and 1 video`,
  ko: `사진 ${n}장과 영상 1개`,
})
