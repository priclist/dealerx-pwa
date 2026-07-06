/**
 * Facebook Marketplace scraper (South Africa)
 * Note: FB Marketplace requires JS rendering and auth.
 * This scraper uses the public-facing approach and OpenClaw's browser tool.
 */

import { BaseScraper, ScrapedListing, ScrapeResult } from './base'

export class FacebookMarketplaceScraper extends BaseScraper {
  name = 'Facebook Marketplace'
  source = 'FACEBOOK_MARKETPLACE'

  private baseUrl = 'https://www.facebook.com/marketplace'

  async scrape(): Promise<ScrapeResult> {
    try {
      // Try the GraphQL endpoint that Marketplace uses
      const listings = await this.tryGraphQL()
      if (listings.length > 0) {
        return { source: this.name, listings }
      }

      // Fallback: return empty (FB requires browser automation)
      return {
        source: this.name,
        listings: [],
        error: 'Facebook Marketplace requires browser automation. Run via OpenClaw browser tool.',
      }
    } catch (err) {
      return {
        source: this.name,
        listings: [],
        error: err instanceof Error ? err.message : String(err),
      }
    }
  }

  private async tryGraphQL(): Promise<ScrapedListing[]> {
    try {
      // FB Marketplace public search
      const url = `${this.baseUrl}/category/vehicles?query=south+africa`
      
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-ZA,en-GB;q=0.9,en;q=0.8',
          'Cookie': '', // Would need session cookies
        },
      })

      if (!res.ok) return []

      const html = await res.text()
      const listings: ScrapedListing[] = []

      // Try to extract from initial state JSON
      const stateRegex = /<script[^>]*id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/s
      const stateMatch = html.match(stateRegex)
      
      if (stateMatch) {
        try {
          const data = JSON.parse(stateMatch[1])
          const edges = this.extractMarketplaceEdges(data)
          listings.push(...edges)
        } catch { /* ignore */ }
      }

      // Also try JSON-LD
      if (listings.length === 0) {
        const jsonLdRegex = /<script type="application\/ld\+json">(.*?)<\/script>/gs
        let match: RegExpExecArray | null
        while ((match = jsonLdRegex.exec(html)) !== null) {
          try {
            const data = JSON.parse(match[1])
            if (data['@type'] === 'ItemList' && data.itemListElement) {
              for (const item of data.itemListElement) {
                const listing = this.parseGraphItem(item)
                if (listing) listings.push(listing)
              }
            }
          } catch { /* ignore */ }
        }
      }

      // Parse HTML cards as last resort
      if (listings.length === 0) {
        this.parseHtmlCards(html, listings)
      }

      return listings
    } catch {
      return []
    }
  }

  private extractMarketplaceEdges(data: any): ScrapedListing[] {
    const listings: ScrapedListing[] = []

    const search = (obj: any): void => {
      if (!obj || typeof obj !== 'object') return

      if (obj.__typename === 'MarketplaceListing' || obj.listing_id || (obj.name && obj.price)) {
        if (obj.price && obj.name) {
          const priceVal = typeof obj.price === 'string'
            ? this.parsePrice(obj.price)
            : parseFloat(obj.price) || 0

          listings.push({
            title: obj.name || obj.title || '',
            sourceId: `fb-${obj.listing_id || obj.id || obj.name}`.replace(/\s+/g, '-'),
            sourceUrl: obj.url || obj.listingUrl || '',
            price: priceVal,
            source: 'FACEBOOK_MARKETPLACE',
            year: obj.year || this.parseYear(obj.name || ''),
            mileage: obj.mileage || obj.odometer || undefined,
            location: obj.location?.name || obj.location || undefined,
            imageUrl: obj.image?.uri || obj.imageUrl || undefined,
            description: obj.description || undefined,
          })
        }
        return
      }

      // Recurse into arrays and objects
      if (Array.isArray(obj)) {
        for (const item of obj) search(item)
      } else {
        for (const val of Object.values(obj)) {
          search(val)
        }
      }
    }

    search(data)
    return listings
  }

  private parseGraphItem(item: any): ScrapedListing | null {
    try {
      const listing = item.item || item
      const title = listing.name || ''
      const price = listing.offers?.price ? parseFloat(listing.offers.price) : 0

      if (!title || !price) return null

      return {
        title,
        sourceId: `fb-${listing.url || title}`.replace(/\s+/g, '-').toLowerCase(),
        sourceUrl: listing.url || '',
        price,
        year: this.parseYear(title),
        imageUrl: listing.image?.[0] || undefined,
      }
    } catch {
      return null
    }
  }

  private parseHtmlCards(html: string, listings: ScrapedListing[]): void {
    // Look for marketplace listing cards
    const patterns = [
      /<div[^>]*class="[^"]*(?:marketplace-listing|listing-card|story-body)[^"]*"[^>]*>[\s\S]*?data-testid="[^"]*listing[^"]*"[\s\S]*?<\/div>/gi,
      /<a[^>]*href="\/marketplace\/item\/[^"]+"[^>]*>[\s\S]*?<\/a>/gi,
    ]

    for (const pattern of patterns) {
      let match: RegExpExecArray | null
      while ((match = pattern.exec(html)) !== null) {
        const card = match[0]
        const titleMatch = card.match(/<span[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)<\/span>/i) ||
                           card.match(/<p[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)<\/p>/i)
        const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : ''

        const priceMatch = card.match(/R\s*[\d\s,]+/)
        const price = priceMatch ? this.parsePrice(priceMatch[0]) : 0

        const linkMatch = card.match(/href="([^"]+)"/)
        const url = linkMatch ? linkMatch[1] : ''

        if (title && price > 0) {
          listings.push({
            title,
            sourceId: `fb-${url || title}`.replace(/\s+/g, '-').toLowerCase(),
            sourceUrl: url.startsWith('http') ? url : `https://www.facebook.com${url}`,
            price,
            year: this.parseYear(title),
          })
        }
      }
      if (listings.length > 0) break
    }
  }
}
