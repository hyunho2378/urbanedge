import { createContext, useContext } from 'react'

// 화면 루트 요소를 내려 주는 컨텍스트. 끌기 좌표 변환과 코치마크가 쓴다.
export const StageContext = createContext({ current: null })
export const useStageRef = () => useContext(StageContext)
