import moment from 'moment'
import { getNZExposureLocations } from './ExposureLocations/GetExposureLocations'
import { reshapeNZData } from './ExposureLocations/Helpers'
import { ImpoverishedTransaction, matchAlgorithm } from './matching'

export interface CSVLineBNZ {
  Date: string
  Payee: string
  Particulars: string | number
  Code: string | number
}

export interface CSVLineANZ {
  Type: string
  Details: string
  Particulars: string
  Code: string
  Reference: string
  Date: string
}

export async function getLoisFromCsvDataBNZ(data: CSVLineBNZ[]) {
  const transactions: ImpoverishedTransaction[] = []
  for (let i: number = 0; i < data.length; i++) {
    const line = data[i]
    const addr = `${line.Payee} ${line.Particulars}`
    const id = `${line.Date}-${line.Payee}-${line.Particulars}-${line.Code}`

    const transaction = {
      _id: id,
      merchant: {
        name: addr,
      },
      date: moment(line.Date, 'DD/MM/YYYY').toString(),
    }
    transactions.push(transaction)
  }
  const exposureLocations = await getNZExposureLocations()
  const lois = matchAlgorithm(transactions, reshapeNZData(exposureLocations))
  return lois
}


export async function getLoisFromCsvDataANZ(data: CSVLineANZ[]) {
  const transactions: ImpoverishedTransaction[] = []
  for (let i: number = 0; i < data.length; i++) {
    const line = data[i]
    let addr = ""
    if (line.Type === "Eft-Pos") {
      addr = `${line.Details}`
    }
    if (line.Code === "Visa Purchase") {
      addr = `${line.Code}`
    }
    const id = `${line.Date}-${line.Details}-${i}`

    const transaction = {
      _id: id,
      merchant: {
        name: addr,
      },
      date: moment(line.Date, 'DD/MM/YYYY').toString(),
    }
    transactions.push(transaction)
  }
  const exposureLocations = await getNZExposureLocations()
  const lois = matchAlgorithm(transactions, reshapeNZData(exposureLocations))
  return lois
}

