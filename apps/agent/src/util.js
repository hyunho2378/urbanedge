import { execFile } from 'node:child_process'

// 외부 명령을 안전하게 실행한다(셸을 거치지 않는다). 결과는 { code, signal, stdout, stderr }로 돌려준다.
export function run(cmd, args = [], opts = {}) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: opts.timeout ?? 15000, maxBuffer: 16 * 1024 * 1024, encoding: opts.binary ? 'buffer' : 'utf8' }, (err, stdout, stderr) => {
      if (err && err.code === 'ENOENT') return resolve({ code: 127, signal: null, stdout: '', stderr: `${cmd}: 설치되어 있지 않다`, missing: true })
      resolve({ code: err ? (typeof err.code === 'number' ? err.code : 1) : 0, signal: err?.signal ?? null, stdout, stderr: String(stderr ?? '') })
    })
  })
}

export const has = async (cmd) => !(await run('/usr/bin/which', [cmd])).code
