# COMPONENTS.md

공통 컴포넌트는 `packages/design-system/src/components`에 있고 상세 상태는 `UI.md` 7장에 정리한다. 앱 전용 컴포넌트는 앱 안의 `components`에 두고, 두 앱에서 쓰게 되면 디자인시스템으로 올린다.

| 위치 | 컴포넌트 | 소유 |
| --- | --- | --- |
| ds | Button, Container, SectionLabel, Reveal, Marquee, Crosswalk, Checker, CautionTape, RouteRibbon, LineBadge, Tag, Wordmark | 기반 |
| web/layout | Header, Footer, SkipLink, LangToggle, ScrollToTop | W1 |
| web/components/home | Hero, RoomsIndex, Steps, VisitStrip, GalleryStrip, KioskCta | W1 |
| web/components/pages | PageHero, RoomCard, StepCard, Faq, RouteSteps, Lightbox | W2 |
| kiosk/device | DeviceFrame, Stage, LedBar, Lens, CardReader, PrintSlot, CctvNotice | K1 |
| kiosk/components | TouchButton, StepRail, CutPreview, FrameCard, Countdown, CameraView | K2 |
