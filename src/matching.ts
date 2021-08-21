import { parse, isWithinInterval, sub, add } from 'date-fns'
import { EnrichedTransaction } from 'akahu'
import _ from 'lodash'

export type LOI = {
  id: string
  event: string
  location: string
  city: string
  start: Date
  end: Date
  information: string
  coordinates: ICoordinates
  transactions: EnrichedTransaction[]
}

export interface ImpoverishedTransaction {
  _id: string,
  merchant: {
    name: string;
  };
  date: string;
}

export function matchAlgorithm(
  transactions: ImpoverishedTransaction[],
  locations: IReturnData
): LOI[] {
  const merchants: Record<string, string[]> = {}

  for (const trans of transactions) {
    if (trans.merchant) {
      if (merchants[trans.merchant.name]) {
        merchants[trans.merchant.name].push(trans._id)
      } else {
        merchants[trans.merchant.name] = [trans._id]
      }
    }
  }

  let l = locations as any
  for (const location of l.locations) {
    location.transactions = []
    const start = parse(location.start, 'dd/MM/yyyy, hh:mm aa', new Date())
    const end = parse(location.end, 'dd/MM/yyyy, hh:mm aa', new Date())
    location.start = start
    location.end = end

    const start_minus_2_days = sub(start, { days: 2 })
    const end_plus_2_days = add(end, { days: 2 })

    const tokens = location.event.split(' ')
    const relevant = []

    for (let i = 0; i < tokens.length; i++) {
      let relevant_tokens = []
      for (let j = 0; j < i; j++) {
        relevant_tokens.push(tokens[j])
      }

      let str = relevant_tokens.join(' ')
      if (str.length > 3) {
        relevant.push(str)
      }
    }

    for (const str of relevant) {
      if (!str) {
        continue
      }
      const regexp = new RegExp(str + '.*', 'i')
      for (const merch of Object.keys(merchants)) {
        const result = regexp.test(merch)
        if (result) {
          const trans_ids = merchants[merch]
          const trans = trans_ids.map((_id) =>
            transactions.find((t) => t._id === _id)
          )
          for (const t of trans) {
            if (!t) {
              continue
            }
            if (
              isWithinInterval(new Date(t.date), {
                start: start_minus_2_days,
                end: end_plus_2_days,
              })
            ) {
              location.transactions.push(t)
            }
          }
        }
      }
    }
    location.transactions = _.uniqBy(location.transactions, '_id')
  }

  const lois = l.locations.filter((loc: any) => loc.transactions.length > 0)

  return lois as LOI[]
}
