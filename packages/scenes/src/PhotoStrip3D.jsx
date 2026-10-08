import { lazy } from 'react'
import { SceneHost } from './lib/SceneHost.jsx'

const StripCanvas = lazy(() => import('./strip/StripCanvas.jsx'))

export const DEFAULT_STRIP_PHOTOS = ['/img/team/shot-1.jpg', '/img/team/shot-2.jpg', '/img/team/shot-3.jpg', '/img/team/shot-4.jpg']

/**
 * PhotoStrip3D: 실제 인화 스트립(4컷)이 떠 있는 3D 오브젝트. 포인터를 따라 기울고 종이가 살짝 휜다.
 * @param {object} props
 * @param {string[]} [props.photos] 사진 주소 1장 이상. 4장보다 적으면 반복해서 채운다. 기본은 /img/team/shot-1..4.jpg
 * @param {string} [props.className] 부모가 높이를 정한다
 * @param {boolean} [props.interactive=true] 포인터와 기울기에 반응
 * @param {string} [props.label] 접근성 설명
 */
export function PhotoStrip3D({ photos = DEFAULT_STRIP_PHOTOS, className, interactive = true, label = 'A printed UrbanEdge photo strip floating in 3D' }) {
  return <SceneHost className={className} Scene={StripCanvas} sceneProps={{ photos, interactive }} poster={photos[0]} fit="contain" label={label} />
}
