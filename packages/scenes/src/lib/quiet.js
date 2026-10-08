// quiet.js: @react-three/fiber 8이 내부에서 쓰는 THREE.Clock이 three 0.186에서 deprecated 경고를 한 번 낸다.
// 동작에는 영향이 없으므로 이 메시지 하나만 걸러 콘솔을 깨끗하게 둔다(다른 경고는 그대로 통과한다).
if (typeof console !== 'undefined' && !console.__ueQuiet) {
  const warn = console.warn
  console.warn = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) return
    warn.apply(console, args)
  }
  console.__ueQuiet = true
}
