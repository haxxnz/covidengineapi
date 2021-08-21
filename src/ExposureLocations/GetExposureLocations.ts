import { Request, Response } from 'express'
import fetch from 'node-fetch'

let cache: any

/**
 * Fetches the Ministry of Health COVID-19 Exposure Sites
 * @returns Raw Exposure Data as JSON
 */
export const fetchExposureLocations = async () => {
  if (cache) {
    return cache
  }
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
 * Reshape the data into a more friendly format
 * @param rawData Raw MoH dataset to parse
 * @returns Formatted Dataset, strictly typed
 */
export const reshapeData = (rawData: IExposureData): IReturnData => {
  // No locations listed
  if (!rawData?.features) {
    return {
      name: rawData.name || null,
      type: rawData.type || null,
      locations: [],
    }
  }

  // Build locations object
  const locations: ILocation[] = rawData.features.map((location: IFeature) => {
    let data: ILocation = {
      id: location.properties.id,
      event: location.properties.Event,
      location: location.properties.Location,
      city: location.properties.City,
      start: location.properties.Start,
      end: location.properties.End,
      information: location.properties.Information,
      coordinates: {
        lat: location.geometry.coordinates[0],
        lng: location.geometry.coordinates[1],
      },
    }
    return data
  })

  // Output Schema
  const formattedData: IReturnData = {
    name: rawData.name || null,
    type: rawData.type || null,
    locations,
  }

  return formattedData
}

/**
 * Returns the list of exposure locations published by MoH
 * @param req Express Request Object
 * @param res Express Response Object
 * @returns Friendly-formatted list of Exposure Locations
 */
const getExposureLocations = async (req: Request, res: Response) => {
  const rawData: IExposureData = await fetchExposureLocations()
  let output: IReturnData = reshapeData(rawData)

  return res.send(output)
}

export default getExposureLocations
