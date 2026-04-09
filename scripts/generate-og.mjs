import { chromium } from 'playwright'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const htmlFile  = path.resolve(__dirname, 'og-image.html')
const outFile   = path.resolve(__dirname, '../apps/web/public/og.jpg')

const browser = await chromium.launch()
const page    = await browser.newPage()

await page.setViewportSize({ width: 1200, height: 630 })
await page.goto(`file://${htmlFile}`)

// Wait for Google Fonts to load (falls back to system font if offline — still fine)
await page.waitForTimeout(800)

await page.screenshot({
  path:    outFile,
  type:    'jpeg',
  quality: 92,
  clip:    { x: 0, y: 0, width: 1200, height: 630 },
})

await browser.close()

console.log(`✓ OG image saved → ${outFile}`)
