/**
 * WeBuyCars scraper
 * South Africa's largest used car buyer/seller
 */

import { BaseScraper, ScrapedListing, ScrapeResult } from './base'

export class WeBuyCarsScraper extends BaseScraper {
  name = 'WeBuyCars'
  source = 'WEBUYCARS'

  private baseUrl = 'https://www.webuycars.co.za'

  async scrape(): Promise<ScrapeResult> {
    const allListings: ScrapedListing[] = []

    try {
      // Try the API endpoint that the WBC site uses
      const apiUrl = `${this.baseUrl}/api/buy/search/vehicles?page=1&pageSize=50&sortBy=date&order=desc`
      
      console.log(`[WeBuyCars] Fetching ${apiUrl}`)
      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Referer': this.baseUrl,
        },
      })

      if (res.ok) {
        const data = await res.json()
        const listings = this.parseApiResponse(data)
        allListings.push(...listings)
      } else {
        // Fallback: scrape HTML
        console.log(`[WeBuyCars] API returned ${res.status}, falling back to HTML scrape`)
        await this.scrapeHtml(allListings)
      }

      return {
        source: this.name,
        listings: allListings,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[WeBuyCars] Error: ${message}`)
      return {
        source: this.name,
        listings: allListings,
        error: message,
      }
    }
  }

  private parseApiResponse(data: any): ScrapedListing[] {
    const listings: ScrapedListing[] = []

    // Try common API response shapes
    const vehicles = data?.data?.vehicles || data?.vehicles || data?.data?.results || data?.results || []

    for (const v of vehicles) {
      try {
        const title = `${v.make || ''} ${v.model || ''} ${v.year || ''}`.trim() || v.title || v.name || ''
        const price = parseFloat(v.price || v.sellingPrice || v.currentPrice || 0)
        const mileage = parseInt(v.mileage || v.odometer || v.km, 10) || undefined
        const year = parseInt(v.year, 10) || undefined
        const imageUrl = v.images?.[0]?.url || v.image?.url || v.imageUrl || v.image || ''
        const location = v.location || v.city || v.dealerLocation || ''
        const url = v.url || v.slug || ''
        const description = v.description || ''

        if (!title || !price) continue

        const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}/buy${url.startsWith('/') ? '' : '/'}${url}`

        listings.push({
          title,
          sourceId: v.id || v.stockNumber || v.uuid || title.replace(/\s+/g, '-').toLowerCase(),
          sourceUrl: fullUrl,
          price,
          year,
          mileage,
          location: location || undefined,
          imageUrl: imageUrl || undefined,
          description: description || undefined,
          brand: v.make || undefined,
          model: v.model || undefined,
        })
      } catch {
        continue
      }
    }

    return listings
  }

  private async scrapeHtml(allListings: ScrapedListing[]): Promise<void> {
    const urls = [
      '/buy/used-cars',
    ]

    for (const path of urls) {
      const url = `${this.baseUrl}${path}`
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'text/html',
        },
      })

      if (!res.ok) continue

      const html = await res.text()
      
      // Look for JSON data in script tags
      const jsonRegex = /<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s
      const nextMatch = html.match(jsonRegex)
      if (nextMatch) {
        try {
          const nextData = JSON.parse(nextMatch[1])
          const vehicles = this.extractFromNextData(nextData)
          allListings.push(...vehicles)
          return
        } catch { /* ignore */ }
      }

      // Fallback: scan for search result cards
      this.parseCards(html, allListings)
      
      await this.sleep(1500)
    }
  }

  private extractFromNextData(data: any): ScrapedListing[] {
    const listings: ScrapedListing[] = []

    const extractProps = (obj: any): void => {
      if (!obj || typeof obj !== 'object') return
      if (Array.isArray(obj)) {
        for (const item of obj) extractProps(item)
        return
      }

      // Check if this looks like a vehicle
      if (obj.make && (obj.price || obj.sellingPrice)) {
        listings.push(this.parseApiResponse({ vehicles: [obj] })[0])
        return
      }

      for (const val of Object.values(obj)) {
        extractProps(val)
      }
    }

    extractProps(data)
    return listings
  }

  private parseCards(html: string, listings: ScrapedListing[]): void {
    const cardRegex = /<div[^>]*class="[^"]*(?:vehicle-card|car-card|listing-card|product-card)[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/gi
    let match: RegExpExecArray | null

    while ((match = cardRegex.exec(html)) !== null) {
      const card = match[0]

      const titleMatch = card.match(/<h[23][^>]*>(.*?)<\/h[23]>/i)
      const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : ''

      const priceMatch = card.match(/R\s*[\d\s,]+/)
      const price = priceMatch ? this.parsePrice(priceMatch[0]) : 0

      const linkMatch = card.match(/href="([^"]+)"/)
      const url = linkMatch ? linkMatch[1] : ''

      if (title && price > 0) {
        listings.push({
          title,
          sourceId: url || `${title}-${price}`.replace(/\s+/g, '-').toLowerCase(),
          sourceUrl: url.startsWith('http') ? url : `${this.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`,
          price,
          year: this.parseYear(title),
        })
      }
    }
  }
}
