/** Base scraper interface and shared utilities */

export interface ScrapedListing {
  title: string
  sourceId: string
  sourceUrl: string
  price: number
  originalPrice?: number
  year?: number
  mileage?: number
  location?: string
  description?: string
  imageUrl?: string
  sellerName?: string
  sellerPhone?: string
  brand?: string
  model?: string
  category?: string
}

export interface ScrapeResult {
  source: string
  listings: ScrapedListing[]
  error?: string
}

export abstract class BaseScraper {
  abstract name: string
  abstract source: string

  abstract scrape(): Promise<ScrapeResult>

  protected parsePrice(text: string): number {
    const cleaned = text.replace(/[Rr\s,]/g, '').trim()
    const num = parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  protected parseMileage(text: string): number {
    const cleaned = text.replace(/[,\skm]/gi, '').trim()
    const num = parseInt(cleaned, 10)
    return isNaN(num) ? 0 : num
  }

  protected parseYear(text: string): number | undefined {
    const match = text.match(/\b(19\d{2}|20\d{2})\b/)
    return match ? parseInt(match[1], 10) : undefined
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(r => setTimeout(r, ms))
  }
}
