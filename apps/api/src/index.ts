import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { authRouter } from './domains/auth/index.js'
import { learningRouter } from './domains/learning/index.js'
import { assessmentRouter } from './domains/assessment/index.js'
import { certificatesRouter } from './domains/certificates/index.js'
import { jobhubRouter } from './domains/jobhub/index.js'
import { businessRouter } from './domains/business/index.js'
import { notificationsRouter } from './domains/notifications/index.js'

const app = new Hono()

// ─── Global middleware ────────────────────────────────────────────────────────

app.use('*', logger())
app.use(
  '*',
  cors({
    origin: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
    credentials: true,
  }),
)

// ─── Health check ─────────────────────────────────────────────────────────────

app.get('/health', (c) => c.json({ status: 'ok', ts: new Date().toISOString() }))

// ─── Domain routers ──────────────────────────────────────────────────────────

app.route('/auth', authRouter)
app.route('/learning', learningRouter)
app.route('/assessment', assessmentRouter)
app.route('/certificates', certificatesRouter)
app.route('/jobhub', jobhubRouter)
app.route('/business', businessRouter)
app.route('/notifications', notificationsRouter)

// ─── Server ──────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT) || 3001

serve({ fetch: app.fetch, port }, () => {
  console.info(`@intrainin/api running on http://localhost:${port}`)
})

export default app
