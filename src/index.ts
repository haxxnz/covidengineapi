import express, { Application } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import { AkahuClient } from 'akahu'
import getExposureLocations from './ExposureLocations/GetExposureLocations'
import './checkLocations'
require('dotenv').config()

const app: Application = express()
const port = 3001

app.use(cors())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.send('Hello covidengineapi! test')
})

app.get('/locations', getExposureLocations)

const akahuOAuthRedirectUri = 'https://oauth.covidengine.ml/auth/akahu'

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

    res.type('json').send(
      JSON.stringify(
        {
          user,
          accounts,
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
