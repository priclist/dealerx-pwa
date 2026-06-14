import { Router, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

const customerSchema = z.object({
  name: z.string().min(1),
  company: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
})

router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customers = await prisma.customer.findMany({
      include: { _count: { select: { leads: true, sales: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(customers)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = customerSchema.parse(req.body)
    const customer = await prisma.customer.create({ data: body })
    res.status(201).json(customer)
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues }); return }
    res.status(500).json({ error: 'Server error' })
  }
})

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = customerSchema.partial().parse(req.body)
    const customer = await prisma.customer.update({ where: { id: req.params.id as string }, data: body })
    res.json(customer)
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues }); return }
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
