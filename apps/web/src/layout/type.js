// type.js: 웹 공용 타이포 클래스 묶음. 390에서 1440까지는 토큰의 clamp 값이 키우고, 1920 이상은 한 단계씩 올린다.
export const T = {
  h2: 'font-display font-black tracking-tightest leading-tight text-h1 3xl:text-display-m 5xl:text-display-l',
  h3: 'font-display font-extrabold tracking-tight leading-snug text-h2 3xl:text-h1 5xl:text-display-m',
  h4: 'font-display font-bold tracking-tight leading-snug text-h3 3xl:text-h2 5xl:text-h1',
  lead: 'text-pretty text-lead leading-relaxed 3xl:text-h3 5xl:text-h2',
  body: 'text-pretty text-body leading-relaxed 3xl:text-lead 5xl:text-h3',
  small: 'text-body-sm leading-normal 3xl:text-body 5xl:text-lead',
  label: 'ue-label text-label 3xl:text-body-sm 5xl:text-body',
}
