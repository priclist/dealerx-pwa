import { Router, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { authenticate, AuthRequest } from '../middleware/auth'
import { carSpyService } from '../services/carspy/service'
import { scrapers } from '../services/carspy/scrapers'

const router = Router()
router.use(authenticate)

// ─── Stats ───────────────────────────────────────

router.get('/stats', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const stats = await carSpyService.getStats()
    res.json(stats)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// ─── Listings ────────────────────────────────────

router.get('/listings', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1
    const limit = parseInt(req.query.limit as string) || 50
    const source = req.query.source as string | undefined
    const status = req.query.status as string | undefined
    const brand = req.query.brand as string | undefined
    const goodDeals = req.query.goodDeals === 'true'
    const sort = (req.query.sort as string) || 'lastSeenAt'
    const order = (req.query.order as string) || 'desc'

    const where: any = {}
    if (source) where.source = source
    if (status) where.status = status
    if (brand) where.brand = { contains: brand, mode: 'insensitive' }
    if (goodDeals) where.isGoodDeal = true

    const [listings, total] = await Promise.all([
      prisma.carSpyListing.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.carSpyListing.count({ where }),
    ])

    res.json({
      listings,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.get('/listings/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const listing = await prisma.carSpyListing.findUnique({
      where: { id: req.params.id },
      include: { alerts: { orderBy: { createdAt: 'desc' } } },
    })
    if (!listing) { res.status(404).json({ error: 'Not found' }); return }
    res.json(listing)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// ─── Scrape Sources ──────────────────────────────

router.get('/sources', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sources = await prisma.carSpySource.findMany({ orderBy: { name: 'asc' } })
    if (sources.length === 0) {
      // Seed default sources
      const defaults = [
        { name: 'CARS_CO_ZA', label: 'Cars.co.za', baseUrl: 'https://www.cars.co.za', icon: '🚗' },
        { name: 'WEBUYCARS', label: 'WeBuyCars', baseUrl: 'https://www.webuycars.co.za', icon: '🛒' },
        { name: 'CARFIND', label: 'CarFind', baseUrl: 'https://www.carfind.co.za', icon: '🔍' },
        { name: 'WEELI', label: 'Weeli', baseUrl: 'https://www.weeli.co.za', icon: '📱' },
        { name: 'FACEBOOK_MARKETPLACE', label: 'Facebook Marketplace', baseUrl: 'https://www.facebook.com/marketplace', icon: '📘' },
      ]
      for (const d of defaults) {
        await prisma.carSpySource.create({ data: d })
      }
      const seeded = await prisma.carSpySource.findMany({ orderBy: { name: 'asc' } })
      res.json(seeded)
    } else {
      res.json(sources)
    }
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/sources/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      enabled: z.boolean().optional(),
      interval: z.number().int().min(5).optional(),
    })
    const body = schema.parse(req.body)
    const updated = await prisma.carSpySource.update({
      where: { id: req.params.id },
      data: body,
    })
    res.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues }); return }
    res.status(500).json({ error: 'Server error' })
  }
})

// ─── Scrape Runs ─────────────────────────────────

router.post('/run', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const source = (_req.body?.source as string) || null

    let result
    if (source && source in scrapers) {
      result = await carSpyService.runScraper(source as any)
    } else {
      result = await carSpyService.runAllScrapers()
    }

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Scrape failed' })
  }
})

router.get('/runs', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const runs = await prisma.carSpyScrapeRun.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { source: true },
    })
    res.json(runs)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// ─── Alerts ───────────────────────────────────────

router.get('/alerts', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const unreadOnly = req.query.unread === 'true'
    const where: any = {}
    if (unreadOnly) where.read = false

    const alerts = await prisma.carSpyAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        listing: {
          select: { id: true, title: true, price: true, sourceUrl: true, imageUrl: true },
        },
      },
    })
    res.json(alerts)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/alerts/:id/read', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.carSpyAlert.update({
      where: { id: req.params.id },
      data: { read: true },
    })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// ─── Filters ─────────────────────────────────────

router.get('/filters', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const filters = await prisma.carSpyFilter.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(filters)
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/filters', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      name: z.string().min(1),
      minYear: z.number().int().optional().nullable(),
      maxPrice: z.number().positive().optional().nullable(),
      minPrice: z.number().min(0).optional().nullable(),
      maxMileage: z.number().int().min(0).optional().nullable(),
      brands: z.string().optional().nullable(),
      categories: z.string().optional().nullable(),
      minDealScore: z.number().min(0).max(100).optional().default(70),
      notifyTelegram: z.boolean().optional().default(true),
    })
    const data = schema.parse(req.body)
    const filter = await prisma.carSpyFilter.create({ data })
    res.status(201).json(filter)
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues }); return }
    res.status(500).json({ error: 'Server error' })
  }
})

router.put('/filters/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const schema = z.object({
      name: z.string().min(1).optional(),
      enabled: z.boolean().optional(),
      minYear: z.number().int().optional().nullable(),
      maxPrice: z.number().positive().optional().nullable(),
      minPrice: z.number().min(0).optional().nullable(),
      maxMileage: z.number().int().min(0).optional().nullable(),
      brands: z.string().optional().nullable(),
      categories: z.string().optional().nullable(),
      minDealScore: z.number().min(0).max(100).optional(),
      notifyTelegram: z.boolean().optional(),
    })
    const data = schema.parse(req.body)
    const updated = await prisma.carSpyFilter.update({
      where: { id: req.params.id },
      data,
    })
    res.json(updated)
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ error: err.issues }); return }
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/filters/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.carSpyFilter.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

// ─── Apply filters to existing listings ──────────

router.post('/apply-filters', async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const alertsCreated = await carSpyService.applyFilters()
    res.json({ alertsCreated })
  } catch {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router
