import moment from 'moment'

/**
 * Reshape the data into a more friendly format
 * @param rawData Raw MoH dataset to parse
 * @returns Formatted Dataset, strictly typed
 */
export const reshapeNZData = (rawData: IExposureData): IReturnData => {
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
    country: 'NEW_ZEALAND',
    locations,
  }

  return formattedData
}

/**
 * Reshapes the input data into JSON
 * @param rawData Unstructured AU Data
 * @returns Structured JSON of input data
 */
export const reshapeAUData = (rawData: Array<Array<any>>) => {
  // Build locations object
  const locations = rawData.map((location) => {
    let data: ICrisperData = {
      id: location[0],
      date: location[1],
      postcode: location[2],
      site: location[3],
      venue: location[4],
      geocoded_address: location[5],
      suburb: location[6],
      state: location[7],
      coordinates: {
        lat: location[8],
        lng: location[9],
      },
      times: location[10],
      alert: location[11],
      detail: location[12],
      status: location[13],
      alert_type: location[14],
      date_string: location[15],
      report_date: location[16],
    }
    return data
  })

  // Output Schema
  const formattedData: IReturnData = {
    name: 'covid_contact_locations',
    type: null,
    country: 'AUSTRALIA',
    locations,
  }

  return formattedData
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
      start: loc.times,
      end: loc.times,
      status: loc.status,
    }
    return data
  })

  let anzData = {
    nz: nzReshape,
    au: auReshape,
  }

  return anzData
}
