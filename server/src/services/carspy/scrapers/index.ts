export { BaseScraper } from './base'
export type { ScrapedListing, ScrapeResult } from './base'
export { CarsCoZaScraper } from './carscoza'
export { WeBuyCarsScraper } from './webuycars'
export { CarFindScraper } from './carfind'
export { WeeliScraper } from './weeli'
export { FacebookMarketplaceScraper } from './facebook'

/** All registered scrapers — ordered by reliability */
export const scrapers = {
  CARS_CO_ZA: new CarsCoZaScraper(),
  WEBUYCARS: new WeBuyCarsScraper(),
  CARFIND: new CarFindScraper(),
  WEELI: new WeeliScraper(),
  FACEBOOK_MARKETPLACE: new FacebookMarketplaceScraper(),
}

export type ScraperKey = keyof typeof scrapers
