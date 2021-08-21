type Nullable<T> = T | undefined | null;

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
  locations?: ILocation[]
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
}

interface ICoordinates {
  lat: number
  lng: number
}
