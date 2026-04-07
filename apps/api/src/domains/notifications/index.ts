import { Hono } from 'hono'

const notifications = new Hono()

const stub = { status: 'ok', message: 'not implemented' }

// FCM device token registration
notifications.post('/devices', (c) => c.json(stub))
notifications.delete('/devices/:token', (c) => c.json(stub))

// Notification preferences
notifications.get('/preferences', (c) => c.json(stub))
notifications.put('/preferences', (c) => c.json(stub))

// Paystack payment webhook (no auth — verified by HMAC)
notifications.post('/webhooks/paystack', (c) => c.json(stub))

export { notifications as notificationsRouter }
