// coupon/index.js: 쿠폰 코드 생성, 검증, 카드. 웹(W1)은 CouponCard의 scratch 모드로 긁는 카드를, 키오스크(K2)는 validateCouponCode로 입력 코드를 확인한다.
export { COUPON_PREFIX, COUPON_ALPHABET, generateCouponCode, generateCoupons, validateCouponCode, normalizeCouponCode, formatCouponCode } from './generator.js'
export { CouponCard } from './CouponCard.jsx'
