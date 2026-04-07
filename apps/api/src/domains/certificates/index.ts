import { Hono } from 'hono'

const certificates = new Hono()

const stub = { status: 'ok', message: 'not implemented' }

// Learner certificate list
certificates.get('/', (c) => c.json(stub))

// Issue certificate (triggered internally after all tests passed)
certificates.post('/issue', (c) => c.json(stub))

// Public verification — no auth required
certificates.get('/verify/:code', (c) => c.json(stub))

export { certificates as certificatesRouter }
