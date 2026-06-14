import { Router, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

const leadSchema = z.object({
  status: z.enum(['NEW', 'CONTACTED', 'NEGOTIATION', 'WON', 'LOST']).optional(),
  value: z.number().min(0).optional(),
  notes: z.string().optional(),
  customerId: z.string().min(1),
  agentId: z.string().optional(),
})

router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const leads = await prisma.lead.findMany({
      include: { customer: true, agent: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(leads)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id as string },
      include: { customer: true, agent: true, activities: true },
    })
    if (!lead) { res.status(404).json({ error: 'Not found' }); return }
    res.json(lead)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = leadSchema.parse(req.body)
    const lead = await prisma.lead.create({
      data: body,
      include: { customer: true },
    })
    res.status(201).json(lead)
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues }); return }
    res.status(500).json({ error: 'Server error' })
  }
})

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = leadSchema.partial().parse(req.body)
    const lead = await prisma.lead.update({
      where: { id: req.params.id as string },
      data: body,
      include: { customer: true },
    })
    res.json(lead)
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues }); return }
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
