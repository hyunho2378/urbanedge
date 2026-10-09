import { makePool, migrate } from './db.js'
import { createApp } from './app.js'

process.env.TZ = process.env.TZ || 'Asia/Seoul'
const pool = makePool()
await migrate(pool)
const { app } = createApp({ pool })
const port = Number(process.env.PORT) || 8787
const server = app.listen(port, () => console.log(`UrbanEdge API listening on ${port}`))
const stop = () => server.close(() => pool.end().then(() => process.exit(0)))
process.on('SIGTERM', stop)
process.on('SIGINT', stop)
