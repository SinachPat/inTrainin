import { Hono } from 'hono'

const jobhub = new Hono()

const stub = { status: 'ok', message: 'not implemented' }

// Worker profile (opt-in)
jobhub.get('/profile', (c) => c.json(stub))
jobhub.put('/profile', (c) => c.json(stub))

// Job listings + matches
jobhub.get('/jobs', (c) => c.json(stub))
jobhub.get('/matches', (c) => c.json(stub))

// Hire requests
jobhub.post('/hire-requests', (c) => c.json(stub))
jobhub.get('/hire-requests', (c) => c.json(stub))
jobhub.patch('/hire-requests/:id', (c) => c.json(stub))

export { jobhub as jobhubRouter }
