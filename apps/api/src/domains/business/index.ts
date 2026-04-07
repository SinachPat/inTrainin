import { Hono } from 'hono'

const business = new Hono()

const stub = { status: 'ok', message: 'not implemented' }

// Business profile
business.get('/profile', (c) => c.json(stub))
business.put('/profile', (c) => c.json(stub))

// Team management
business.get('/members', (c) => c.json(stub))
business.post('/members/invite', (c) => c.json(stub))
business.delete('/members/:id', (c) => c.json(stub))

// Role assignments
business.post('/assignments', (c) => c.json(stub))
business.get('/assignments', (c) => c.json(stub))

// Team progress reporting
business.get('/progress', (c) => c.json(stub))

// Payments (Enterprise plan)
business.post('/subscribe', (c) => c.json(stub))
business.get('/subscription', (c) => c.json(stub))

export { business as businessRouter }
