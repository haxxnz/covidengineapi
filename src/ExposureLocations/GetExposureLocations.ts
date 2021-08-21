import { Request, Response } from 'express'
import moment from 'moment'
import fetch from 'node-fetch'
import { reshapeAUData, reshapeNZData } from './Helpers'

let cache: any

/**
 * Fetches the Ministry of Health COVID-19 Exposure Sites
 * @returns Raw Exposure Data as JSON
 */
const getNZExposureLocations = async () => {
  try {
    const dataset = await fetch(
      'https://raw.githubusercontent.com/minhealthnz/nz-covid-data/main/locations-of-interest/august-2021/locations-of-interest.geojson'
    )
    const result = await dataset.json()
    cache = result
    return result
  } catch (ex) {
    console.log(ex)
    return []
  }
}

/**
 * Fetches the CRISPER Exposure Data (AU Gov)
 * @returns Raw Exposure Data
 */
const getAUExposureLocations = async () => {
  try {
    const dataset = await fetch(
      'https://data.crisper.net.au/table/covid_contact_locations'
    )
    return await dataset.json()
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
  const rawNZData: IExposureData = await getNZExposureLocations()
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

  const rawNZData: IExposureData = await getNZExposureLocations()
  const nzData: IReturnData = reshapeNZData(rawNZData)

  let combined = reshapeANZData(nzData, auData)

  return res.send(combined)
}

export const reshapeANZData = (nzData: IReturnData, auData: IReturnData) => {
  let nzReshape = nzData?.locations?.map((loc: ILocation) => {
    let parsedStart = moment(loc.start, 'DD/MM/YYYY, hh:mm a').toDate()
    let parsedEnd = moment(loc.end, 'DD/MM/YYYY, hh:mm a').toDate()

    let data: IMergedLocation = {
      id: loc.id,
      site: loc.event,
      location: loc.location,
      region: loc.city,
      information: loc.information,
      coordinates: loc.coordinates,
      start: parsedStart,
      end: parsedEnd,
      status: 'active',
    }
    return data
  })

  let auReshape = auData?.locations?.map((loc: ICrisperData) => {
    // let parsedStart = moment(loc.start, 'DD/MM/YYYY, hh:mm a').toDate()
    // let parsedEnd = moment(loc.end, 'DD/MM/YYYY, hh:mm a').toDate()

    let data: IMergedLocation = {
      id: loc.id,
      site: loc.venue,
      location: loc.geocoded_address,
      region: `${loc.suburb}, ${loc.state}`,
      information: loc.alert,
      coordinates: loc.coordinates,
      // start: parsedStart,
      // end: parsedEnd,
      status: loc.status,
    }
    return data
  })

  let anzData = {
    nz: nzReshape,
    au: auReshape
  }

  return anzData
}

const parseAUDate = (input: string) => {
  // format
}
