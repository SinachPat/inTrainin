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
import { roadmapRouter } from './domains/roadmap/index.js'
import { paymentsRouter } from './domains/payments/index.js'

const app = new Hono()

// ─── Global middleware ────────────────────────────────────────────────────────

app.use('*', logger())
// CORS_ORIGIN supports a single origin or a comma-separated list, e.g.:
//   https://intrainin.vercel.app
//   https://intrainin.vercel.app,https://www.intrainin.com
const allowedOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map(o => o.trim().replace(/\/$/, '')) // trim spaces and trailing slashes

console.info('[cors] allowed origins:', allowedOrigins)

app.use(
  '*',
  cors({
    origin: (origin) => {
      if (!origin) return allowedOrigins[0]            // non-browser requests
      const clean = origin.replace(/\/$/, '')
      return allowedOrigins.includes(clean) ? clean : null
    },
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
app.route('/roadmap', roadmapRouter)
app.route('/payments', paymentsRouter)

// ─── Server ──────────────────────────────────────────────────────────────────

const port = Number(process.env.PORT) || 3001

serve({ fetch: app.fetch, port }, () => {
  console.info(`@intrainin/api running on http://localhost:${port}`)
})

export default app
