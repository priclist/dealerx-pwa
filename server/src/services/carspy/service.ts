/**
 * CarSpy Service — orchestrates scraping, dedup, storage, and filtering
 */

import prisma from '../../lib/prisma'
import { scrapers, ScraperKey } from './scrapers'
import type { ScrapedListing } from './scrapers'

export class CarSpyService {
  /**
   * Run all enabled scrapers and store results
   */
  async runAllScrapers(): Promise<{
    totalFound: number
    totalNew: number
    totalUpdated: number
    sourceResults: { source: string; found: number; new: number; updated: number; error?: string }[]
  }> {
    const sourceResults: any[] = []
    let totalFound = 0
    let totalNew = 0
    let totalUpdated = 0

    for (const [key, scraper] of Object.entries(scrapers)) {
      try {
        const result = await this.runScraper(key as ScraperKey)
        sourceResults.push(result)
        totalFound += result.found
        totalNew += result.new
        totalUpdated += result.updated
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        sourceResults.push({
          source: key,
          found: 0,
          new: 0,
          updated: 0,
          error: message,
        })
      }
    }

    return {
      totalFound,
      totalNew,
      totalUpdated,
      sourceResults,
    }
  }

  /**
   * Run a single scraper and store its listings
   */
  async runScraper(key: ScraperKey): Promise<{
    source: string
    found: number
    new: number
    updated: number
    error?: string
  }> {
    const scraper = scrapers[key]
    const sourceName = scraper.name

    // Create a scrape run record
    const run = await prisma.carSpyScrapeRun.create({
      data: {
        status: 'running',
        sourceId: undefined, // optional relation
      },
    })

    try {
      const result = await scraper.scrape()
      let listingsNew = 0
      let listingsUpdated = 0

      if (result.error) {
        await prisma.carSpyScrapeRun.update({
          where: { id: run.id },
          data: {
            status: 'failed',
            error: result.error,
            completedAt: new Date(),
          },
        })
        return { source: sourceName, found: 0, new: 0, updated: 0, error: result.error }
      }

      // Process each listing — upsert to handle dedup
      for (const listing of result.listings) {
        const upserted = await this.upsertListing(key, listing)
        if (upserted === 'created') listingsNew++
        else if (upserted === 'updated') listingsUpdated++
      }

      // Mark the run as completed
      await prisma.carSpyScrapeRun.update({
        where: { id: run.id },
        data: {
          status: 'completed',
          listingsFound: result.listings.length,
          listingsNew,
          listingsUpdated,
          completedAt: new Date(),
        },
      })

      return {
        source: sourceName,
        found: result.listings.length,
        new: listingsNew,
        updated: listingsUpdated,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      await prisma.carSpyScrapeRun.update({
        where: { id: run.id },
        data: { status: 'failed', error: message, completedAt: new Date() },
      })
      return { source: sourceName, found: 0, new: 0, updated: 0, error: message }
    }
  }

  /**
   * Upsert a listing — creates or updates based on source + sourceId
   * Returns 'created', 'updated', or 'skipped'
   */
  private async upsertListing(source: string, listing: ScrapedListing): Promise<'created' | 'updated' | 'skipped'> {
    try {
      const existing = await prisma.carSpyListing.findFirst({
        where: {
          source: source as any,
          sourceId: listing.sourceId,
        },
      })

      if (existing) {
        // Check for price change
        const priceChanged = existing.price !== listing.price

        await prisma.carSpyListing.update({
          where: { id: existing.id },
          data: {
            price: listing.price,
            originalPrice: existing.originalPrice ?? listing.originalPrice,
            mileage: listing.mileage ?? existing.mileage,
            location: listing.location ?? existing.location,
            imageUrl: listing.imageUrl ?? existing.imageUrl,
            description: listing.description ?? existing.description,
            sellerName: listing.sellerName ?? existing.sellerName,
            sellerPhone: listing.sellerPhone ?? existing.sellerPhone,
            sourceUrl: listing.sourceUrl ?? existing.sourceUrl,
            status: priceChanged ? 'PRICE_DROPPED' : existing.status,
            priceChangedAt: priceChanged ? new Date() : existing.priceChangedAt,
            lastSeenAt: new Date(),
          },
        })

        // Create alert for price drop
        if (priceChanged && listing.price < existing.price) {
          const dropAmount = existing.price - listing.price
          await prisma.carSpyAlert.create({
            data: {
              listingId: existing.id,
              type: 'price_drop',
              message: `💰 Price dropped by R${dropAmount.toLocaleString()} on ${listing.title} — now R${listing.price.toLocaleString()}`,
            },
          })
        }

        return 'updated'
      }

      // Create new listing
      const created = await prisma.carSpyListing.create({
        data: {
          title: listing.title,
          source: source as any,
          sourceId: listing.sourceId,
          sourceUrl: listing.sourceUrl,
          sourceName: listing.sellerName,
          price: listing.price,
          originalPrice: listing.originalPrice,
          year: listing.year,
          mileage: listing.mileage,
          location: listing.location,
          description: listing.description,
          imageUrl: listing.imageUrl,
          sellerName: listing.sellerName,
          sellerPhone: listing.sellerPhone,
          brand: listing.brand,
          model: listing.model,
          category: listing.category || 'OTHER',
        },
      })

      // Create alert for new listing
      await prisma.carSpyAlert.create({
        data: {
          listingId: created.id,
          type: 'new_listing',
          message: `🆕 New listing: ${listing.title} — R${listing.price.toLocaleString()}`,
        },
      })

      return 'created'
    } catch (err) {
      // If unique constraint violation, it's a duplicate → skip
      if (err && typeof err === 'object' && 'code' in err && (err as any).code === 'P2002') {
        return 'skipped'
      }
      throw err
    }
  }

  /**
   * Apply filters to all listings and mark good deals
   */
  async applyFilters(): Promise<number> {
    const filters = await prisma.carSpyFilter.findMany({ where: { enabled: true } })
    const listings = await prisma.carSpyListing.findMany({
      where: { status: { not: 'IGNORED' }, isGoodDeal: false },
    })

    let alertsCreated = 0

    for (const listing of listings) {
      for (const filter of filters) {
        const score = this.calculateDealScore(listing, filter)
        if (score >= (filter.minDealScore ?? 70)) {
          await prisma.carSpyListing.update({
            where: { id: listing.id },
            data: { isGoodDeal: true, dealScore: score },
          })

          await prisma.carSpyAlert.create({
            data: {
              listingId: listing.id,
              type: 'good_deal',
              message: `🔥 Good deal! ${listing.title} — R${listing.price.toLocaleString()} (score: ${Math.round(score)}%)`,
            },
          })
          alertsCreated++
          break // Only need one filter to match
        }
      }
    }

    return alertsCreated
  }

  /**
   * Calculate a deal score (0-100) based on filter criteria
   */
  private calculateDealScore(listing: CarSpyListingData, filter: CarSpyFilterData): number {
    let score = 50 // base score
    let factors = 0

    // Price factor: lower is better (vs maxPrice)
    if (filter.maxPrice && listing.price > 0) {
      const priceRatio = 1 - (listing.price / filter.maxPrice)
      score += priceRatio * 30
      factors++
    }

    // Year factor: newer is better
    if (filter.minYear && listing.year) {
      if (listing.year >= filter.minYear) {
        score += 10
      } else {
        score -= 20
      }
      factors++
    }

    // Mileage factor: lower is better
    if (filter.maxMileage && listing.mileage !== undefined && listing.mileage > 0) {
      const mileageRatio = 1 - (listing.mileage / filter.maxMileage)
      score += mileageRatio * 20
      factors++
    }

    // Brand match bonus
    if (filter.brands && listing.brand) {
      const brandList = filter.brands.split(',').map(b => b.trim().toLowerCase())
      if (brandList.some(b => listing.brand!.toLowerCase().includes(b) || b.includes(listing.brand!.toLowerCase()))) {
        score += 10
      }
      factors++
    }

    return Math.max(0, Math.min(100, score))
  }

  /**
   * Get stats for the CarSpy dashboard
   */
  async getStats() {
    const [
      totalListings,
      newListings,
      goodDeals,
      alerts,
      recentRuns,
    ] = await Promise.all([
      prisma.carSpyListing.count(),
      prisma.carSpyListing.count({ where: { status: 'NEW' } }),
      prisma.carSpyListing.count({ where: { isGoodDeal: true } }),
      prisma.carSpyAlert.count({ where: { read: false } }),
      prisma.carSpyScrapeRun.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return {
      totalListings,
      newListings,
      goodDeals,
      unreadAlerts: alerts,
      recentRuns,
    }
  }

  /**
   * Seed initial filter if none exist
   */
  async seedDefaults(): Promise<void> {
    const count = await prisma.carSpyFilter.count()
    if (count === 0) {
      await prisma.carSpyFilter.create({
        data: {
          name: 'Good Deal Default',
          minYear: 2019,
          maxPrice: 350000,
          maxMileage: 80000,
          minDealScore: 70,
          notifyTelegram: true,
        },
      })
      await prisma.carSpyFilter.create({
        data: {
          name: 'Premium Vehicles',
          minYear: 2022,
          maxPrice: 700000,
          maxMileage: 40000,
          minDealScore: 75,
          notifyTelegram: true,
        },
      })
    }
  }
}

interface CarSpyListingData {
  price: number
  year?: number | null
  mileage?: number | null
  brand?: string | null
  model?: string | null
}

interface CarSpyFilterData {
  minYear?: number | null
  maxPrice?: number | null
  maxMileage?: number | null
  brands?: string | null
  minDealScore?: number | null
}

export const carSpyService = new CarSpyService()
