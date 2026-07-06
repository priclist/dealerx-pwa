/**
 * CarFind.co.za scraper
 */

import { BaseScraper, ScrapedListing, ScrapeResult } from './base'

export class CarFindScraper extends BaseScraper {
  name = 'CarFind'
  source = 'CARFIND'

  private baseUrl = 'https://www.carfind.co.za'

  async scrape(): Promise<ScrapeResult> {
    const listings: ScrapedListing[] = []

    try {
      const url = `${this.baseUrl}/search.aspx`
      await this.sleep(2000)

      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html',
          'Accept-Language': 'en-ZA,en;q=0.9',
        },
      })

      if (!res.ok) {
        return { source: this.name, listings, error: `HTTP ${res.status}` }
      }

      const html = await res.text()
      
      // Try JSON-LD
      const jsonLdRegex = /<script type="application\/ld\+json">(.*?)<\/script>/gs
      let match: RegExpExecArray | null
      while ((match = jsonLdRegex.exec(html)) !== null) {
        try {
          const data = JSON.parse(match[1])
          const items = data['@graph'] || [data]
          for (const item of items) {
            if (item['@type'] === 'Product' || item['@type'] === 'Car') {
              const listing = this.parseStructuredData(item)
              if (listing && !listings.find(l => l.sourceId === listing.sourceId)) {
                listings.push(listing)
              }
            }
          }
        } catch { /* ignore */ }
      }

      // Fallback: parse search result cards
      if (listings.length === 0) {
        this.parseCards(html, listings)
      }

      return { source: this.name, listings }
    } catch (err) {
      return {
        source: this.name,
        listings,
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

      const sourceId = url || title.replace(/\s+/g, '-').toLowerCase()
      const year = this.parseYear(title)

      return {
        title,
        sourceId: sourceId + '-carfind',
        sourceUrl: url.startsWith('http') ? url : `${this.baseUrl}${url}`,
        price,
        year,
        description,
        imageUrl: imageUrl || undefined,
      }
    } catch {
      return null
    }
  }

  private parseCards(html: string, listings: ScrapedListing[]): void {
    const cardsRegex = /<div[^>]*class="[^"]*(?:search-result|vehicle-item|listing-box|car-item)[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi
    let match: RegExpExecArray | null

    while ((match = cardsRegex.exec(html)) !== null) {
      const card = match[0]

      const titleMatch = card.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>(.*?)<\/a>/i) ||
                         card.match(/<h[23][^>]*>(.*?)<\/h[23]>/i)
      const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : ''

      const priceMatch = card.match(/R\s*[\d\s,]+/)
      const price = priceMatch ? this.parsePrice(priceMatch[0]) : 0

      const linkMatch = card.match(/href="([^"]+)"(?:[^>]*>)\s*<\/(?:a|div)>/i) ||
                        card.match(/<a[^>]*href="([^"]+)"[^>]*>/i)
      const url = linkMatch ? linkMatch[1] : ''

      if (title && price > 0) {
        listings.push({
          title,
          sourceId: url || `${title}-${price}`.replace(/\s+/g, '-').toLowerCase() + '-carfind',
          sourceUrl: url.startsWith('http') ? url : `${this.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`,
          price,
          year: this.parseYear(title),
        })
      }
    }
  }
}
