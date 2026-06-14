import { Router, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

const vehicleSchema = z.object({
  name: z.string().min(1),
  brand: z.string().min(1),
  category: z.enum(['TRUCK', 'TRAILER', 'EQUIPMENT', 'OTHER']),
  price: z.number().positive(),
  buyPrice: z.number().min(0).optional(),
  condition: z.string().optional(),
  kmHours: z.number().min(0).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED']).optional(),
  notes: z.string().optional(),
})

router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vehicles = await prisma.vehicle.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(vehicles)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const vehicle = await prisma.vehicle.findUnique({ where: { id: req.params.id as string } })
    if (!vehicle) { res.status(404).json({ error: 'Not found' }); return }
    res.json(vehicle)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = vehicleSchema.parse(req.body)
    const vehicle = await prisma.vehicle.create({ data: body as Parameters<typeof prisma.vehicle.create>[0]['data'] })
    res.status(201).json(vehicle)
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues }); return }
    res.status(500).json({ error: 'Server error' })
  }
})

router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = vehicleSchema.partial().parse(req.body)
    const vehicle = await prisma.vehicle.update({ where: { id: req.params.id as string }, data: body as Parameters<typeof prisma.vehicle.update>[0]['data'] })
    res.json(vehicle)
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues }); return }
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.vehicle.delete({ where: { id: req.params.id as string } })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
