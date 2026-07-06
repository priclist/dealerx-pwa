/**
 * OpenClaw CarSpy Runner
 * 
 * This script is called by OpenClaw on a cron schedule.
 * It runs all scrapers, applies filters, and reports results.
 * 
 * Usage from OpenClaw:
 *   node server/src/services/carspy/openclaw-runner.ts
 * 
 * Or via cron job:
 *   Run every 6 hours to keep listing data fresh
 */

import 'dotenv/config'
import { carSpyService } from './service'

async function main() {
  console.log('🦾 CarSpy — OpenClaw run started')
  const start = Date.now()

  try {
    // Step 1: Run all scrapers
    console.log('📡 Scraping marketplaces...')
    const scrapeResult = await carSpyService.runAllScrapers()
    console.log(`✅ Scrape complete: ${scrapeResult.totalFound} found, ${scrapeResult.totalNew} new, ${scrapeResult.totalUpdated} updated`)

    for (const src of scrapeResult.sourceResults) {
      const status = src.error ? `❌ ${src.error}` : `✅ ${src.found} found (${src.new} new, ${src.updated} updated)`
      console.log(`   ${src.source}: ${status}`)
    }

    // Step 2: Seed default sources/filters if needed
    await carSpyService.seedDefaults()

    // Step 3: Apply filters to find good deals
    console.log('🔍 Applying deal filters...')
    const alertsCreated = await carSpyService.applyFilters()
    console.log(`✅ Filters applied: ${alertsCreated} new good deal alerts`)

    // Step 4: Get summary stats
    const stats = await carSpyService.getStats()
    const elapsed = ((Date.now() - start) / 1000).toFixed(1)

    console.log(`\n📊 CarSpy Summary (${elapsed}s):`)
    console.log(`   Total listings tracked: ${stats.totalListings}`)
    console.log(`   New since last run: ${stats.newListings}`)
    console.log(`   Good deals found: ${stats.goodDeals}`)
    console.log(`   Unread alerts: ${stats.unreadAlerts}`)

    // Return summary as JSON for OpenClaw to use
    const summary = {
      status: 'success',
      elapsed: `${elapsed}s`,
      ...stats,
      scrapeResult,
      alertsCreated,
    }

    console.log('\n--- CARSPY_RESULT ---')
    console.log(JSON.stringify(summary))
    console.log('--- END_CARSPY_RESULT ---')

  } catch (err) {
    console.error('❌ CarSpy run failed:', err instanceof Error ? err.message : err)
    process.exit(1)
  }
}

main()
