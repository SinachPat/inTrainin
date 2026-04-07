import { Hono } from 'hono'

const learning = new Hono()

const stub = { status: 'ok', message: 'not implemented' }

// Roles & catalogue
learning.get('/roles', (c) => c.json(stub))
learning.get('/roles/:slug', (c) => c.json(stub))

// Enrolment
learning.post('/enrol', (c) => c.json(stub))
learning.get('/enrolments', (c) => c.json(stub))

// Topic content + progress
learning.get('/topics/:id', (c) => c.json(stub))
learning.post('/topics/:id/complete', (c) => c.json(stub))
learning.get('/progress/:roleSlug', (c) => c.json(stub))

export { learning as learningRouter }
