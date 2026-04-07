import { Hono } from 'hono'

const auth = new Hono()

const stub = { status: 'ok', message: 'not implemented' }

auth.post('/signup', (c) => c.json(stub))
auth.post('/login', (c) => c.json(stub))
auth.post('/logout', (c) => c.json(stub))
auth.post('/refresh', (c) => c.json(stub))
auth.post('/otp/send', (c) => c.json(stub))
auth.post('/otp/verify', (c) => c.json(stub))
auth.post('/password/reset', (c) => c.json(stub))

export { auth as authRouter }
