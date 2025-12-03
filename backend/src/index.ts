import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import auth from './routes/auth'

const app = new Hono()

app.use('/*', cors({
    origin: 'http://localhost:3000',
    credentials: true,
}))

app.get('/', (c) => {
    return c.text('Hello Hono!')
})

app.route('/auth', auth)

const port = Number(process.env.PORT) || 4000
console.log(`Server is running on port ${port}`)

serve({
    fetch: app.fetch,
    port
})
