import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'SALES_MANAGER', 'SALES_AGENT']).optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = registerSchema.parse(req.body)
    const exists = await prisma.user.findUnique({ where: { email: body.email } })
    if (exists) {
      res.status(400).json({ error: 'Email already in use' })
      return
    }
    const hashed = await bcrypt.hash(body.password, 12)
    const user = await prisma.user.create({
      data: { name: body.name, email: body.email, password: hashed, role: body.role ?? 'SALES_AGENT' },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions)
    res.status(201).json({ user, token })
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues })
      return
    }
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = loginSchema.parse(req.body)
    const user = await prisma.user.findUnique({ where: { email: body.email } })
    if (!user || !(await bcrypt.compare(body.password, user.password))) {
      res.status(401).json({ error: 'Invalid credentials' })
      return
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: process.env.JWT_EXPIRES_IN ?? '7d' } as jwt.SignOptions)
    res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role }, token })
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues })
      return
    }
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    })
    if (!user) {
      res.status(404).json({ error: 'User not found' })
      return
    }
    res.json(user)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
