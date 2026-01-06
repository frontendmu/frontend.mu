import type { HttpContext } from '@adonisjs/core/http'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

interface SponsorJson {
  id: string
  name: string
  logo: string
  logomark: string
  website: string | null
  description: string | null
  sponsor_type: string[]
  darkbg: boolean
  meetups: Array<{
    id: number
    title: string
    date: string
    location: string
    venue: string
    description: string | null
  }>
}

function loadSponsors(): SponsorJson[] {
  const sponsorsPath = join(__dirname, '../../../../packages/frontendmu-data/data/sponsors-raw.json')
  return JSON.parse(readFileSync(sponsorsPath, 'utf-8')) as SponsorJson[]
}

export default class SponsorsController {
  async index({ inertia }: HttpContext) {
    let sponsors: any[] = []

    try {
      const sponsorsData = loadSponsors()

      sponsors = sponsorsData.map((sponsor) => ({
        id: sponsor.id,
        name: sponsor.name,
        website: sponsor.website,
        description: sponsor.description,
        sponsorTypes: sponsor.sponsor_type,
        darkbg: sponsor.darkbg,
      }))
    } catch (error) {
      console.log('Error loading sponsors:', error.message || error)
    }

    return inertia.render('sponsors', {
      sponsors,
    })
  }

  async show({ params, inertia }: HttpContext) {
    let sponsor: any = null
    let meetups: any[] = []

    try {
      const sponsorsData = loadSponsors()
      const sponsorData = sponsorsData.find((s: SponsorJson) => s.id === params.id)

      if (sponsorData) {
        sponsor = {
          id: sponsorData.id,
          name: sponsorData.name,
          website: sponsorData.website,
          description: sponsorData.description,
          sponsorTypes: sponsorData.sponsor_type,
          darkbg: sponsorData.darkbg,
        }
        meetups = sponsorData.meetups || []
      }
    } catch (error) {
      console.log('Error loading sponsor:', error.message || error)
    }

    return inertia.render('sponsor', {
      sponsor,
      meetups,
    })
  }
}
