import { Request, Response } from 'express'
import fetch from 'node-fetch'
import { reshapeANZData, reshapeAUData, reshapeNZData } from './Helpers'

let nzCache: any
let auCache: any

interface ExposureEventsResultItem {
  eventId: string
  notificationId: string
  glnHash: string
  start: string
  end: string
  systemNotificationBody: string
  appBannerTitle: string
  appBannerBody: string
  appBannerLinkLabel: string
  appBannerLinkUrl: string
  appBannerRequestCallbackEnabled: string
}

interface GlnPair {
  gln: string
  glnHash: string
}
export interface NzExposureLocations {
  result: IExposureData
  exposureEventsResult: {
    items: ExposureEventsResultItem[]
  }
  glnPairs: GlnPair[]
  glnLastUpdated: string
}
/**
 * Fetches the Ministry of Health COVID-19 Exposure Sites
 * @returns Raw Exposure Data as JSON
 */
export async function getNZExposureLocations(): Promise<NzExposureLocations> {
  if (nzCache) return nzCache

  try {
    const dataset = await fetch(
      'https://raw.githubusercontent.com/minhealthnz/nz-covid-data/main/locations-of-interest/august-2021/locations-of-interest.geojson'
    )
    const result = await dataset.json()
    const exposureEvents = await fetch(
      'https://exposure-events.tracing.covid19.govt.nz/current-exposure-events.json'
    )
    const exposureEventsResult = await exposureEvents.json()

    const glnPairsRes = await fetch(
      'https://raw.githubusercontent.com/CovidEngine/reverseglnhashes/main/glnPairs.json'
    )
    const glnPairs: GlnPair[] = await glnPairsRes.json()
    const glnLastUpdatedRes = await fetch(
      'https://raw.githubusercontent.com/CovidEngine/reverseglnhashes/main/lastUpdatedAt.json'
    )
    const glnLastUpdated: string = await glnLastUpdatedRes.json()

    nzCache = { result, exposureEventsResult, glnPairs, glnLastUpdated }
    return { result, exposureEventsResult, glnPairs, glnLastUpdated }
  } catch (ex) {
    console.log(ex)
    return {
      result: {},
      exposureEventsResult: { items: [] },
      glnPairs: [],
      glnLastUpdated: new Date(0).toISOString(),
    }
  }
}

/**
 * Fetches the CRISPER Exposure Data (AU Gov)
 * @returns Raw Exposure Data
 */
const getAUExposureLocations = async () => {
  if (auCache) return auCache

  try {
    const dataset = await fetch(
      'https://data.crisper.net.au/table/covid_contact_locations'
    )
    const result = await dataset.json()
    auCache = result
    return result
  } catch (ex) {
    console.log(ex)
    return []
  }
}

// Route Handlers

export const handleAUExposureLocations = async (
  req: Request,
  res: Response
) => {
  const rawAUData: Array<Array<any>> = await getAUExposureLocations()
  const auData: IReturnData = reshapeAUData(rawAUData)
  // let output: IReturnData = reshapeData(rawData)

  return res.send(auData)
}

/**
 * Returns the list of exposure locations published by MoH
 * @param req Express Request Object
 * @param res Express Response Object
 * @returns Friendly-formatted list of Exposure Locations
 */
export const handleNZExposureLocations = async (
  req: Request,
  res: Response
) => {
  const rawNZData = await getNZExposureLocations()
  const nzData: IReturnData = reshapeNZData(rawNZData)

  return res.send(nzData)
}

export const handleANZExposureLocations = async (
  req: Request,
  res: Response
) => {
  // Get Exposure Sites and shape data
  const rawAUData: Array<Array<any>> = await getAUExposureLocations()
  const auData: IReturnData = reshapeAUData(rawAUData)

  const rawNZData = await getNZExposureLocations()
  const nzData: IReturnData = reshapeNZData(rawNZData)

  const combined = reshapeANZData(nzData, auData)

  return res.send(combined)
}
