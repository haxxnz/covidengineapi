require('dotenv').config() // Load this shit otherwise the rest is fucked
import { AkahuClient, EnrichedTransaction, Paginated } from 'akahu'
import cors from 'cors'
import express, { Application } from 'express'
import morgan from 'morgan'
import multer from 'multer'
import './checkLocations'
import { ensureConnectToDB } from './db'
import {
  getNZExposureLocations,
  handleANZExposureLocations,
  handleAUExposureLocations,
  handleNZExposureLocations,
} from './ExposureLocations/GetExposureLocations'
import { reshapeNZData } from './ExposureLocations/Helpers'
import { matchAlgorithm } from './matching'

const app: Application = express()
const port = 3001

const upload = multer()

app.use(cors())
app.use(morgan('dev'))
ensureConnectToDB()
app.get('/', (req, res) => {
  res.send(
    '<a href="https://oauth.akahu.io/?client_id=app_token_cksl325vd000109mjaenwgicd&response_type=code&redirect_uri=https://oauth.covidengine.ml/auth/akahu&scope=ENDURING_CONSENT">Login with Akahu</a>'
  )
})

app.get('/locations', handleANZExposureLocations)
app.get('/locations/nz', handleNZExposureLocations)
app.get('/locations/au', handleAUExposureLocations)

app.post('/uploadcsv', upload.single('csv'), (req, res) => {
  const csv = req.file?.buffer.toString()
  const sessionUserId = req.body.sessionUserId
  res.send(JSON.stringify({csv,sessionUserId}, null, 2))
})

const akahuOAuthRedirectUri = 'https://oauth.covidengine.ml/auth/akahu'

function minusDaysFromNow(days: number): Date {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date
}

app.get('/auth/akahu', async (req, res) => {
  const { AKAHU_APP_TOKEN, AKAHU_APP_SECRET } = process.env
  const code = req.query.code

  if (!AKAHU_APP_TOKEN || !AKAHU_APP_SECRET) {
    res.send({
      message: 'AKAHU_APP_TOKEN and AKAHU_APP_SECRET must be set in .env',
    })
    return
  }
  if (!code || typeof code !== 'string') {
    res.send({ message: 'code is not supplied' })
    return
  }

  const akahu = new AkahuClient({
    appToken: AKAHU_APP_TOKEN,
    appSecret: AKAHU_APP_SECRET,
  })

  try {
    const tokenResponse = await akahu.auth.exchange(code, akahuOAuthRedirectUri)
    const { access_token, expires_in } = tokenResponse

    const user = await akahu.users.get(access_token)
    const accounts = await akahu.accounts.list(access_token)

    const now = new Date()
    const two_weeks_ago = minusDaysFromNow(14)

    const all_transactions: EnrichedTransaction[] = []
    await Promise.all(
      accounts.map(async (account) => {
        const transactions_paged = []
        let transactions: Paginated<EnrichedTransaction>
        let next: string | undefined
        do {
          transactions = (await akahu.accounts.listTransactions(
            access_token,
            account._id,
            {
              start: two_weeks_ago.toISOString(),
              end: now.toISOString(),
              cursor: next,
            }
          )) as any

          // typing is broken here, next should be string | undefined but its string | null
          if (!transactions.cursor.next) {
            next = undefined
          } else {
            next = transactions.cursor.next
          }

          transactions_paged.push(...transactions.items)
        } while (transactions.cursor.next)
        all_transactions.push(...transactions_paged)
      })
    )

    const exposureLocations = await getNZExposureLocations()

    const lois = matchAlgorithm(
      all_transactions,
      reshapeNZData(exposureLocations)
    )

    res.type('json').send(
      JSON.stringify(
        {
          user,
          lois,
        },
        null,
        2
      )
    )
  } catch (error) {
    res.send({ error: error.message })
  }
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
