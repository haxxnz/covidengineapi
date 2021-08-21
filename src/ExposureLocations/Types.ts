type Nullable<T> = T | undefined | null

interface IExposureData {
  type?: string
  name?: string
  features?: IFeature[]
}

interface IFeature {
  type: string
  properties: IProperties
  geometry: IGeometry
}

interface IProperties {
  id: string
  Event: string
  Location: string
  City: string
  Start: string
  End: string
  Information: string
}

interface IGeometry {
  type: string
  coordinates: number[]
}

// Below: Return Data Schemas

interface IReturnData {
  type?: Nullable<string>
  name?: Nullable<string>
  country?: string
  locations?: ILocation[] | ICrisperData[]
}

interface ILocation {
  id: string
  event: string
  location: string
  city: string
  start: string
  end: string
  information: string
  coordinates: ICoordinates
  eventId: string
  glnHash?: string
  gln?: string
}

interface ICoordinates {
  lat: number
  lng: number
}

interface ICrisperData {
  id: string
  date: string
  postcode: string
  site: string
  venue: string
  geocoded_address: string
  suburb: string
  state: string
  coordinates: ICoordinates
  times: string
  alert: string
  detail: string
  status: string
  alert_type: string
  date_string: string
  report_date: string
}

interface IMergedLocation {
  id: string
  site: string // Event and Venue,
  location: string // Location and Geocoded Address
  region: string // City and Suburb + State
  start: Date | String // Date and Start
  end: Date | String // Start & End and Times
  information: string // Information and Alert (maybe detail)
  coordinates: ICoordinates
  status: string // Status and 'Active'
}
