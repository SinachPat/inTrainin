import { Hono } from 'hono'

const assessment = new Hono()

const stub = { status: 'ok', message: 'not implemented' }

// Start / submit a test attempt
assessment.post('/tests/:topicId/start', (c) => c.json(stub))
assessment.post('/tests/:attemptId/submit', (c) => c.json(stub))

// Attempt history and cooldown status
assessment.get('/tests/:topicId/attempts', (c) => c.json(stub))
assessment.get('/tests/:topicId/cooldown', (c) => c.json(stub))

export { assessment as assessmentRouter }
