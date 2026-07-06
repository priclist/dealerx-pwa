/**
 * Weeli.co.za scraper
 * SA car marketplace
 */

import { BaseScraper, ScrapedListing, ScrapeResult } from './base'

export class WeeliScraper extends BaseScraper {
  name = 'Weeli'
  source = 'WEELI'

  private baseUrl = 'https://www.weeli.co.za'

  async scrape(): Promise<ScrapeResult> {
    const allListings: ScrapedListing[] = []

    try {
      const url = `${this.baseUrl}/used-cars`
      console.log(`[Weeli] Fetching ${url}`)

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'en-ZA,en;q=0.9',
        },
      })

      if (!res.ok) {
        return { source: this.name, listings: [], error: `HTTP ${res.status}` }
      }

      const html = await res.text()

      // Try JSON-LD first
      const jsonLdRegex = /<script type="application\/ld\+json">(.*?)<\/script>/gs
      let match: RegExpExecArray | null
      while ((match = jsonLdRegex.exec(html)) !== null) {
        try {
          const data = JSON.parse(match[1])
          const items = data['@graph'] || [data]
          for (const item of items) {
            if (item['@type'] === 'Product' || item['@type'] === 'Vehicle' || item['@type'] === 'Car') {
              const listing = this.parseStructuredData(item)
              if (listing) allListings.push(listing)
            }
          }
        } catch { /* ignore */ }
      }

      // Try API endpoints
      if (allListings.length === 0) {
        await this.tryApi(allListings)
      }

      // Fallback: HTML parsing
      if (allListings.length === 0) {
        this.parseHtml(html, allListings)
      }

      return { source: this.name, listings: allListings }
    } catch (err) {
      return {
        source: this.name,
        listings: allListings,
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  private parseStructuredData(item: any): ScrapedListing | null {
    try {
      const title = item.name || ''
      const price = item.offers?.price ? parseFloat(item.offers.price) : 0
      const url = item.url || ''
      const imageUrl = item.image?.[0] || item.image || ''
      const description = item.description || ''

      if (!title || !price) return null

      // Extract from additionalProperty
      let year: number | undefined
      let mileage: number | undefined

      if (item.additionalProperty && Array.isArray(item.additionalProperty)) {
        for (const prop of item.additionalProperty) {
          const val = prop.value?.toString() || ''
          const name = (prop.name || '').toLowerCase()
          if (name.includes('year') || name.includes('model year')) {
            year = parseInt(val, 10) || undefined
          }
          if (name.includes('mileage') || name.includes('km')) {
            mileage = parseInt(val.replace(/[,\skm]/gi, ''), 10) || undefined
          }
        }
      }

      if (!year) year = this.parseYear(title)

      return {
        title,
        sourceId: url || `${title}-${price}`.replace(/\s+/g, '-').toLowerCase() + '-weeli',
        sourceUrl: url.startsWith('http') ? url : `${this.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`,
        price,
        year,
        mileage,
        description: description || undefined,
        imageUrl: imageUrl || undefined,
      }
    } catch {
      return null
    }
  }

  private async tryApi(listings: ScrapedListing[]): Promise<void> {
    try {
      const apiUrl = `${this.baseUrl}/api/v1/vehicles?limit=50&status=available`
      const res = await fetch(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'Referer': this.baseUrl,
        },
      })

      if (res.ok) {
        const data = await res.json()
        const vehicles = data?.vehicles || data?.data?.vehicles || data?.results || data?.data || []

        for (const v of vehicles) {
          try {
            const title = `${v.make || v.brand || ''} ${v.model || ''}`.trim() || v.name || v.title || ''
            const price = parseFloat(v.price || v.sellingPrice || v.currentPrice || 0)
            if (!title || !price) continue

            listings.push({
              title,
              sourceId: `weeli-${v.id || v.stockId || v.uuid || title}`.replace(/\s+/g, '-').toLowerCase(),
              sourceUrl: v.url ? `${this.baseUrl}${v.url}` : this.baseUrl,
              price,
              year: parseInt(v.year, 10) || this.parseYear(title),
              mileage: parseInt(v.mileage || v.km || v.odometer, 10) || undefined,
              location: v.location || v.city || undefined,
              imageUrl: v.images?.[0]?.url || v.imageUrl || v.image || undefined,
              description: v.description || undefined,
              brand: v.make || v.brand || undefined,
              model: v.model || undefined,
            })
          } catch { /* skip bad item */ }
        }
      }
    } catch { /* API not available */ }
  }

  private parseHtml(html: string, listings: ScrapedListing[]): void {
    const cardRegex = /<div[^>]*class="[^"]*(?:car-card|vehicle-card|listing-card|product-item)[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi
    let match: RegExpExecArray | null

    while ((match = cardRegex.exec(html)) !== null) {
      const card = match[0]

      const titleMatch = card.match(/<h[23][^>]*>(.*?)<\/h[23]>/i) ||
                         card.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)<\/a>/i)
      const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : ''

      const priceMatch = card.match(/R\s*[\d\s,]+/)
      const price = priceMatch ? this.parsePrice(priceMatch[0]) : 0

      const linkMatch = card.match(/href="([^"]+)"/)
      const url = linkMatch ? linkMatch[1] : ''

      if (title && price > 0) {
        listings.push({
          title,
          sourceId: url ? `weeli-${url}`.replace(/\s+/g, '-').toLowerCase() : `weeli-${title}-${price}`.replace(/\s+/g, '-').toLowerCase(),
          sourceUrl: url.startsWith('http') ? url : `${this.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`,
          price,
          year: this.parseYear(title),
        })
      }
    }
  }
}
