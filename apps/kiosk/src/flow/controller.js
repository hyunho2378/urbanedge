import { useState } from 'react'
import { STEPS } from './steps.js'

// controller.js: 키오스크 상태 컨트롤러 계약. K2(flow)가 실제 구현으로 교체한다.
// K1(device, Simulator 페이지)은 아래 반환 필드만 사용한다. 필드 이름과 의미를 바꾸지 않는다.
//
//   step            현재 단계 id (steps.js)
//   steps           STEPS
//   goTo(id)        단계로 이동 (시뮬레이터 점프용)
//   reset()         attract로 복귀하고 모든 선택을 초기화
//   lang, setLang   'ko' | 'en'
//   cuts            4 | 8 | null
//   hintZone        'camera' | 'card' | 'slot' | 'screen' | null  기기의 실제 부품을 가리키는 안내 (K1이 외형에서 강조)
//   flashing        촬영 순간 true (K1이 LED 바를 밝힌다)
//   printUrl        인화 결과 이미지 data URL 또는 null (K1이 출구 슬롯에서 종이를 내민다)
//   cameraActive    카메라가 켜진 상태면 true (K1이 렌즈 표시등을 켠다)
//   cameraMode, setCameraMode   'live'(웹캠) | 'sample'(샘플 이미지)
export function useKioskController() {
  const [step, setStep] = useState('attract')
  const [lang, setLang] = useState('ko')
  const [cameraMode, setCameraMode] = useState('sample')
  return {
    step,
    steps: STEPS,
    goTo: setStep,
    reset: () => setStep('attract'),
    lang,
    setLang,
    cuts: null,
    hintZone: null,
    flashing: false,
    printUrl: null,
    cameraActive: false,
    cameraMode,
    setCameraMode,
  }
}
