require('dotenv').config() // Load this shit otherwise the rest is fucked
import express, { Application } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { AkahuClient, Paginated, Transaction } from 'akahu'
import getExposureLocations from './ExposureLocations/GetExposureLocations'
import './checkLocations'
import { ensureConnectToDB } from './db'

const app: Application = express()
const port = 3001

app.use(cors())
app.use(morgan('dev'))
ensureConnectToDB()
app.get('/', (req, res) => {
  res.send(
    '<a href="https://oauth.akahu.io/?client_id=app_token_cksl325vd000109mjaenwgicd&response_type=code&redirect_uri=https://oauth.covidengine.ml/auth/akahu&scope=ENDURING_CONSENT">Login with Akahu</a>'
  )
})

app.get('/locations', getExposureLocations)

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

    const all_transactions = await Promise.all(
      accounts.flatMap(async (account) => {
        const transactions_paged = []
        let transactions: Paginated<Transaction>
        let next: string | undefined
        do {
          transactions = await akahu.accounts.listTransactions(
            access_token,
            account._id,
            {
              start: two_weeks_ago.toISOString(),
              end: now.toISOString(),
              cursor: next,
            }
          )

          // typing is broken here, next should be string | undefined but its string | null
          if (!transactions.cursor.next) {
            next = undefined
          } else {
            next = transactions.cursor.next
          }

          transactions_paged.push(...transactions.items)
        } while (transactions.cursor.next)
        return transactions_paged
      })
    )

    res.type('json').send(
      JSON.stringify(
        {
          user,
          accounts,
          transactions: all_transactions,
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
