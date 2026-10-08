import { Component } from 'react'
import { Link } from 'react-router-dom'

// 하위 페이지가 오류를 던져도 앱 전체가 죽지 않게 막는다. 경로가 바뀌면 resetKey로 다시 시도한다.
export default class RouteBoundary extends Component {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidUpdate(prev) {
    if (prev.resetKey !== this.props.resetKey && this.state.failed) this.setState({ failed: false })
  }

  render() {
    if (!this.state.failed) return this.props.children
    const ko = typeof document !== 'undefined' && document.documentElement.lang === 'ko'
    return (
      <section className="px-page section-y min-h-dvh">
        <h1 className="font-display text-h1 font-bold">{ko ? '페이지를 열 수 없어요' : 'This page could not load'}</h1>
        <Link to="/" className="mt-32 inline-block font-ui font-semibold text-yellow underline underline-offset-4">
          {ko ? '홈으로' : 'Home'}
        </Link>
      </section>
    )
  }
}
