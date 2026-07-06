/**
 * Cars.co.za scraper
 * Scrapes car listings from South Africa's largest automotive marketplace
 */

import { BaseScraper, ScrapedListing, ScrapeResult } from './base'

export class CarsCoZaScraper extends BaseScraper {
  name = 'Cars.co.za'
  source = 'CARS_CO_ZA'

  private baseUrl = 'https://www.cars.co.za'
  private searchUrls = [
    '/search/used-cars/south-africa',
  ]

  async scrape(): Promise<ScrapeResult> {
    const allListings: ScrapedListing[] = []

    try {
      for (const path of this.searchUrls) {
        const url = `${this.baseUrl}${path}`
        console.log(`[CarsCoZa] Fetching ${url}`)

        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'en-ZA,en-GB;q=0.9,en;q=0.8',
          },
        })

        if (!res.ok) {
          console.warn(`[CarsCoZa] HTTP ${res.status} for ${url}`)
          continue
        }

        const html = await res.text()
        const listings = this.parseListings(html)
        allListings.push(...listings)

        // Small delay between pages
        await this.sleep(1500)
      }

      return {
        source: this.name,
        listings: allListings,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      console.error(`[CarsCoZa] Error: ${message}`)
      return {
        source: this.name,
        listings: allListings,
        error: message,
      }
    }
  }

  private parseListings(html: string): ScrapedListing[] {
    const listings: ScrapedListing[] = []

    // Try to find listing cards/items in the HTML
    // Strategy: look for structured data patterns

    // Pattern 1: JSON-LD structured data
    const jsonLdRegex = /<script type="application\/ld\+json">(.*?)<\/script>/gs
    let match: RegExpExecArray | null
    while ((match = jsonLdRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(match[1])
        if (data['@type'] === 'Product' || data['@type'] === 'Car') {
          const listing = this.jsonLdToListing(data)
          if (listing) listings.push(listing)
        }
        // Handle @graph arrays
        if (data['@graph'] && Array.isArray(data['@graph'])) {
          for (const item of data['@graph']) {
            if (item['@type'] === 'Product' || item['@type'] === 'Car') {
              const listing = this.jsonLdToListing(item)
              if (listing) listings.push(listing)
            }
          }
        }
      } catch {
        // Skip invalid JSON
      }
    }

    // Pattern 2: Look for listing cards in HTML (fallback)
    if (listings.length === 0) {
      this.parseHtmlListings(html, listings)
    }

    return listings
  }

  private jsonLdToListing(data: any): ScrapedListing | null {
    try {
      const title = data.name || ''
      const price = data.offers?.price ? parseFloat(data.offers.price) : 0
      const url = data.url || ''
      const imageUrl = data.image?.[0] || data.image || ''
      const description = data.description || ''

      let year: number | undefined
      let mileage: number | undefined
      let brand: string | undefined
      let model: string | undefined

      // Extract from additionalProperty or brand/model
      if (data.brand?.name) brand = data.brand.name
      if (data.model) model = data.model

      if (data.additionalProperty && Array.isArray(data.additionalProperty)) {
        for (const prop of data.additionalProperty) {
          const val = prop.value?.toString() || ''
          const name = (prop.name || '').toLowerCase()
          if (name.includes('year')) year = parseInt(val, 10) || undefined
          if (name.includes('mileage') || name.includes('odometer')) {
            mileage = parseInt(val.replace(/[,\skm]/gi, ''), 10) || undefined
          }
        }
      }

      // Extract year from title if not found
      if (!year) {
        const yearMatch = title.match(/\b(19\d{2}|20\d{2})\b/)
        if (yearMatch) year = parseInt(yearMatch[1], 10)
      }

      // Extract brand from title if not found
      const knownBrands = ['Toyota', 'Volkswagen', 'Ford', 'BMW', 'Mercedes-Benz', 'Mercedes', 'Audi', 'Nissan', 'Hyundai', 'Kia', 'Honda', 'Mazda', 'Chevrolet', 'Renault', 'Opel', 'Peugeot', 'Citroën', 'Citroen', 'Fiat', 'Jaguar', 'Land Rover', 'Volvo', 'Mini', 'Suzuki', 'Daihatsu', 'Isuzu', 'Mitsubishi', 'Subaru', 'Lexus', 'Porsche', 'Jeep', 'Alfa Romeo', 'Bentley', 'Ferrari', 'Lamborghini', 'Maserati', 'Range Rover']
      if (!brand) {
        for (const b of knownBrands) {
          if (title.toLowerCase().includes(b.toLowerCase())) {
            brand = b
            break
          }
        }
      }

      if (!title || !price) return null

      return {
        title,
        sourceId: url || title.replace(/\s+/g, '-').toLowerCase(),
        sourceUrl: url.startsWith('http') ? url : `https://www.cars.co.za${url}`,
        price,
        year,
        mileage,
        description,
        imageUrl,
        brand,
        model,
        location: data.offers?.availableAtOrFrom?.name || undefined,
      }
    } catch {
      return null
    }
  }

  private parseHtmlListings(html: string, listings: ScrapedListing[]): void {
    // Fallback: extract listing data from common HTML patterns

    // Look for article/card elements
    const cardRegexes = [
      /<article[^>]*class="[^"]*listing[^"]*"[^>]*>[\s\S]*?<\/article>/gi,
      /<div[^>]*class="[^"]*(?:vehicle|listing|card|result|item)[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
      /<a[^>]*class="[^"]*vehicle[^"]*"[^>]*href="([^"]+)"[^>]*>[\s\S]*?<\/a>/gi,
    ]

    for (const regex of cardRegexes) {
      let cardMatch: RegExpExecArray | null
      while ((cardMatch = regex.exec(html)) !== null) {
        const card = cardMatch[0]

        // Extract title
        const titleMatch = card.match(/<h[23][^>]*>(.*?)<\/h[23]>/i)
        const title = titleMatch ? titleMatch[1].replace(/<[^>]*>/g, '').trim() : ''

        // Extract price
        const priceMatch = card.match(/R\s*[\d\s,]+(?:\.\d{2})?/)
        const price = priceMatch ? this.parsePrice(priceMatch[0]) : 0

        // Extract URL
        const urlMatch = card.match(/href="([^"]+)"/)
        const url = urlMatch ? urlMatch[1] : ''

        // Extract image
        const imgMatch = card.match(/<img[^>]*src="([^"]+)"[^>]*>/i)
        const imageUrl = imgMatch ? imgMatch[1] : ''

        if (title && price > 0) {
          const year = this.parseYear(title)

          // Try to find mileage in the card text
          let mileage: number | undefined
          const mileageRegex = /(\d[\d,]*)\s*(?:km|kms|kilometres?)/i
          const mileageMatch = card.match(mileageRegex)
          if (mileageMatch) {
            mileage = parseInt(mileageMatch[1].replace(/,/g, ''), 10)
          }

          listings.push({
            title,
            sourceId: url || `${title}-${price}`.replace(/\s+/g, '-').toLowerCase(),
            sourceUrl: url.startsWith('http') ? url : `${this.baseUrl}${url.startsWith('/') ? '' : '/'}${url}`,
            price,
            year: year || undefined,
            mileage,
            imageUrl: imageUrl || undefined,
          })
        }
      }

      // If we found listings with this pattern, don't try others
      if (listings.length > 0) break
    }
  }
}
