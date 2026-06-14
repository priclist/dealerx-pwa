import { Router, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

const querySchema = z.object({
  query: z.string().min(1),
})

router.post('/query', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = querySchema.parse(req.body)
    const q = query.toLowerCase()

    const [vehicles, leads, sales] = await Promise.all([
      prisma.vehicle.findMany(),
      prisma.lead.findMany({ include: { customer: true } }),
      prisma.sale.findMany(),
    ])

    const totalRevenue = sales.reduce((s: number, sale: { sellPrice: number }) => s + sale.sellPrice, 0)
    const totalProfit = sales.reduce((s: number, sale: { margin: number }) => s + sale.margin, 0)
    const available = vehicles.filter((v: { status: string }) => v.status === 'AVAILABLE').length
    const won = leads.filter((l: { status: string }) => l.status === 'WON').length
    const conversionRate = leads.length > 0 ? Math.round((won / leads.length) * 100) : 0

    let response = ''

    if (q.includes('sales') || q.includes('revenue')) {
      response = `Your total sales revenue is $${totalRevenue.toLocaleString()} with a total profit of $${totalProfit.toLocaleString()}. You have processed ${sales.length} sales transactions.`
    } else if (q.includes('inventory') || q.includes('vehicle') || q.includes('stock')) {
      const byCategory = vehicles.reduce((acc: Record<string, number>, v: { category: string }) => {
        acc[v.category] = (acc[v.category] || 0) + 1
        return acc
      }, {})
      response = `You have ${vehicles.length} total vehicles. ${available} are available. Breakdown: ${Object.entries(byCategory).map(([k, v]) => `${k}: ${v}`).join(', ')}.`
    } else if (q.includes('lead') || q.includes('conversion')) {
      response = `You have ${leads.length} total leads with a conversion rate of ${conversionRate}%. ${won} deals have been won.`
    } else if (q.includes('profit') || q.includes('margin')) {
      const avgMargin = sales.length > 0 ? Math.round(totalProfit / sales.length) : 0
      response = `Your total profit is $${totalProfit.toLocaleString()} across ${sales.length} sales. Average profit per deal: $${avgMargin.toLocaleString()}.`
    } else {
      response = `Based on your current data: ${vehicles.length} vehicles in inventory (${available} available), ${leads.length} leads tracked, $${totalRevenue.toLocaleString()} in total revenue, and a ${conversionRate}% conversion rate. Ask me anything specific about sales, inventory, leads, or profitability!`
    }

    res.json({ query, response, timestamp: new Date().toISOString() })
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues }); return }
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
