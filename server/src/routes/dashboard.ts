import { Router, Response } from 'express'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

router.get('/stats', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalVehicles, availableVehicles, totalLeads, newLeads, sales, recentActivities] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: 'AVAILABLE' } }),
      prisma.lead.count(),
      prisma.lead.count({ where: { status: 'NEW' } }),
      prisma.sale.findMany({ orderBy: { soldAt: 'desc' }, take: 100 }),
      prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 10, include: { user: { select: { name: true } } } }),
    ])

    const totalRevenue = sales.reduce((sum: number, s) => sum + s.sellPrice, 0)
    const totalProfit = sales.reduce((sum: number, s) => sum + s.margin, 0)
    const openDeals = await prisma.lead.count({ where: { status: { in: ['CONTACTED', 'NEGOTIATION'] } } })

    res.json({
      totalVehicles,
      availableVehicles,
      totalLeads,
      newLeads,
      openDeals,
      totalRevenue,
      totalProfit,
      salesCount: sales.length,
      recentActivities,
    })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
