import { Router, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

const saleSchema = z.object({
  vehicleId: z.string().min(1),
  customerId: z.string().min(1),
  agentId: z.string().min(1),
  sellPrice: z.number().positive(),
  buyPrice: z.number().min(0),
  notes: z.string().optional(),
})

router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sales = await prisma.sale.findMany({
      include: {
        vehicle: true,
        customer: true,
        agent: { select: { id: true, name: true } },
      },
      orderBy: { soldAt: 'desc' },
    })
    res.json(sales)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = saleSchema.parse(req.body)
    const margin = body.sellPrice - body.buyPrice
    const sale = await prisma.sale.create({
      data: { ...body, margin },
      include: { vehicle: true, customer: true },
    })
    await prisma.vehicle.update({ where: { id: body.vehicleId }, data: { status: 'SOLD' } })
    res.status(201).json(sale)
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues }); return }
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
