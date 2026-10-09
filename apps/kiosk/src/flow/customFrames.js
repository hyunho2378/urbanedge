// customFrames.js: 운영 화면 '프레임' 탭에서 만든 프레임을 인화 프레임 목록에 넣는다.
// store의 frames[].custom을 지켜보다가 바뀔 때마다 등록한다. 키오스크 화면과 합성기가 같은 목록을 쓴다.
import { registerFrame } from '@urbanedge/brand'
import { ops } from '../ops/store.js'

let seen = ''
function sync() {
  const list = ops.get().frames.filter((f) => f.custom).map((f) => f.custom)
  const key = JSON.stringify(list)
  if (key === seen) return
  seen = key
  list.forEach((c) => {
    try {
      registerFrame(c)
    } catch {
      /* 기준 프레임이 없으면 건너뛴다 */
    }
  })
}
ops.subscribe(sync)
sync()
