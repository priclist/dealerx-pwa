import { Router, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'

const router = Router()
router.use(authenticate)

const querySchema = z.object({
  query: z.string().min(1),
})

/**
 * AI-powered business intelligence endpoint.
 * Gathers dealership context and uses an LLM to answer smartly.
 * Falls back to structured data responses if AI is unavailable.
 */
router.post('/query', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = querySchema.parse(req.body)
    const q = query.toLowerCase()

    // Gather comprehensive dealership context
    const [vehicles, leads, sales, customers, activities] = await Promise.all([
      prisma.vehicle.findMany(),
      prisma.lead.findMany({ include: { customer: true } }),
      prisma.sale.findMany({ include: { vehicle: true, customer: true } }),
      prisma.customer.findMany(),
      prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ])

    // Compute KPIs
    const totalRevenue = sales.reduce((s: number, sale: { sellPrice: number }) => s + sale.sellPrice, 0)
    const totalProfit = sales.reduce((s: number, sale: { margin: number }) => s + sale.margin, 0)
    const totalBuyCost = sales.reduce((s: number, sale: { buyPrice: number }) => s + sale.buyPrice, 0)
    const available = vehicles.filter((v: { status: string }) => v.status === 'AVAILABLE').length
    const sold = vehicles.filter((v: { status: string }) => v.status === 'SOLD').length
    const reserved = vehicles.filter((v: { status: string }) => v.status === 'RESERVED').length
    const won = leads.filter((l: { status: string }) => l.status === 'WON').length
    const lost = leads.filter((l: { status: string }) => l.status === 'LOST').length
    const negotiation = leads.filter((l: { status: string }) => l.status === 'NEGOTIATION').length
    const conversionRate = leads.length > 0 ? Math.round((won / leads.length) * 100) : 0
    const avgMargin = sales.length > 0 ? Math.round(totalProfit / sales.length) : 0
    const avgDaysOnLot = vehicles.length > 0
      ? Math.round(vehicles.reduce((s: number, v: { createdAt: Date }) => s + (Date.now() - new Date(v.createdAt).getTime()) / 86400000, 0) / vehicles.length)
      : 0

    // Category breakdown
    const byCategory: Record<string, { total: number; available: number; sold: number }> = {}
    for (const v of vehicles) {
      const cat = v.category || 'OTHER'
      if (!byCategory[cat]) byCategory[cat] = { total: 0, available: 0, sold: 0 }
      byCategory[cat].total++
      if (v.status === 'AVAILABLE') byCategory[cat].available++
      if (v.status === 'SOLD') byCategory[cat].sold++
    }

    // Top performers
    const topSellers = [...sales]
      .sort((a: any, b: any) => b.sellPrice - a.sellPrice)
      .slice(0, 5)
      .map((s: any) => `${s.vehicle?.name || 'Unknown'} — R${s.sellPrice.toLocaleString()}`)

    const context = {
      dealership: 'Priclist DealerX',
      metrics: {
        inventory: { total: vehicles.length, available, sold, reserved, avgDaysOnLot: `${avgDaysOnLot} days` },
        sales: { count: sales.length, totalRevenue: `R${totalRevenue.toLocaleString()}`, totalProfit: `R${totalProfit.toLocaleString()}`, totalBuyCost: `R${totalBuyCost.toLocaleString()}`, avgMargin: `R${avgMargin.toLocaleString()}`, avgProfitPerDeal: `R${avgMargin.toLocaleString()}` },
        leads: { total: leads.length, won, lost, negotiation, conversionRate: `${conversionRate}%` },
        customers: { total: customers.length },
        categories: byCategory,
        topSellers,
      },
      recentActivity: activities.map((a: any) => `${a.type}: ${a.title}${a.body ? ` — ${a.body}` : ''}`),
    }

    // Try AI-powered response via OpenClaw Gateway
    let aiAnswer: string | null = null
    try {
      const gatewayUrl = process.env.OPENCLAW_GATEWAY_URL || 'http://localhost:18789'
      const gatewayToken = process.env.OPENCLAW_GATEWAY_TOKEN

      if (gatewayToken) {
        const aiResponse = await fetch(`${gatewayUrl}/api/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${gatewayToken}`,
          },
          body: JSON.stringify({
            model: process.env.OPENCLAW_AI_MODEL || 'default',
            messages: [
              {
                role: 'system',
                content: `You are carsX, an intelligent AI dealership assistant embedded in the DealerX app. 
Answer the user's question concisely and informatively using ONLY the provided context data.
If you don't know something or the data doesn't contain the answer, say so.
Keep answers under 200 words. Be data-driven and use numbers.

Current dealership context: ${JSON.stringify(context)}`,
              },
              { role: 'user', content: query },
            ],
            max_tokens: 500,
            temperature: 0.3,
          }),
        })

        if (aiResponse.ok) {
          const data = await aiResponse.json()
          aiAnswer = data?.choices?.[0]?.message?.content || null
        }
      }
    } catch (err) {
      console.warn('[AI] Gateway unavailable, using fallback:', err instanceof Error ? err.message : err)
    }

    // Use AI answer if we got one
    if (aiAnswer) {
      res.json({ query, response: aiAnswer, timestamp: new Date().toISOString(), mode: 'ai' })
      return
    }

    // ─── Fallback: structured data response ───
    let response = ''

    if (q.includes('sales') || q.includes('revenue')) {
      response = `Your total sales revenue is R${totalRevenue.toLocaleString()} with a total profit of R${totalProfit.toLocaleString()}. You have processed ${sales.length} sales transactions with an average margin of R${avgMargin.toLocaleString()} per deal.`
    } else if (q.includes('inventory') || q.includes('vehicle') || q.includes('stock')) {
      const catBreakdown = Object.entries(byCategory).map(([k, v]) => `${k}: ${v.total} total (${v.available} avail, ${v.sold} sold)`).join(', ')
      response = `You have ${vehicles.length} total vehicles. ${available} available, ${sold} sold, ${reserved} reserved. Average days on lot: ${avgDaysOnLot}. Breakdown: ${catBreakdown}.`
    } else if (q.includes('lead') || q.includes('conversion')) {
      response = `You have ${leads.length} total leads with a conversion rate of ${conversionRate}%. ${won} won, ${lost} lost, ${negotiation} in negotiation. ${customers.length} customers total.`
    } else if (q.includes('profit') || q.includes('margin')) {
      response = `Total profit: R${totalProfit.toLocaleString()} across ${sales.length} sales. Average profit per deal: R${avgMargin.toLocaleString()}. Top seller: ${topSellers[0] || 'N/A'}.`
    } else if (q.includes('top') || q.includes('best') || q.includes('performance')) {
      response = `Top 5 sales: ${topSellers.join('; ')}. Conversion rate: ${conversionRate}%. Avg margin: R${avgMargin.toLocaleString()}.`
    } else if (q.includes('customer')) {
      response = `You have ${customers.length} customers. ${leads.length} leads total with a ${conversionRate}% conversion rate.`
    } else if (q.includes('activity') || q.includes('recent')) {
      response = `Recent activity: ${activities.slice(0, 5).map((a: any) => a.title).join('; ') || 'No recent activity'}.`
    } else {
      response = `Here's your snapshot: ${vehicles.length} vehicles (${available} available), ${leads.length} leads (${conversionRate}% conversion), R${totalRevenue.toLocaleString()} revenue, R${totalProfit.toLocaleString()} profit across ${sales.length} sales. Ask me about sales, inventory, leads, customers, profits, or top performers!`
    }

    res.json({ query, response, timestamp: new Date().toISOString(), mode: 'fallback' })
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues }); return }
    console.error('[AI] Error:', err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
