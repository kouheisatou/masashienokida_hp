import { Hono } from 'hono'
import { setCookie, getCookie } from 'hono/cookie'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const auth = new Hono()

// Mock Google Auth for Development (since we don't have real credentials yet)
// In production, use real OAuth flow.

auth.get('/google', (c) => {
    const redirectUrl = 'http://localhost:4000/auth/google/callback'
    // Redirect to Google Consent Screen (Mocked here)
    return c.redirect(redirectUrl)
})

auth.get('/google/callback', async (c) => {
    // Mock getting user info
    const mockUser = {
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://via.placeholder.com/150',
        googleId: '123456789'
    }

    // Upsert User
    const user = await prisma.user.upsert({
        where: { email: mockUser.email },
        update: {},
        create: {
            email: mockUser.email,
            name: mockUser.name,
            image: mockUser.image,
            accounts: {
                create: {
                    type: 'oauth',
                    provider: 'google',
                    providerAccountId: mockUser.googleId
                }
            }
        }
    })

    // Create Session
    const sessionToken = crypto.randomUUID()
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    await prisma.session.create({
        data: {
            sessionToken,
            userId: user.id,
            expires
        }
    })

    // Set Cookie
    setCookie(c, 'session_token', sessionToken, {
        httpOnly: true,
        secure: false, // Set to true in production
        sameSite: 'Lax',
        path: '/',
        expires
    })

    return c.redirect('http://localhost:3000/')
})

auth.get('/me', async (c) => {
    const sessionToken = getCookie(c, 'session_token')
    if (!sessionToken) {
        return c.json({ user: null }, 401)
    }

    const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true }
    })

    if (!session || session.expires < new Date()) {
        return c.json({ user: null }, 401)
    }

    return c.json({ user: session.user })
})

auth.post('/logout', async (c) => {
    const sessionToken = getCookie(c, 'session_token')
    if (sessionToken) {
        await prisma.session.delete({
            where: { sessionToken }
        })
    }
    setCookie(c, 'session_token', '', {
        path: '/',
        expires: new Date(0)
    })
    return c.json({ success: true })
})

export default auth
