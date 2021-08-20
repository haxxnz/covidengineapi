import express, { Application } from 'express'
import cors from 'cors'
import morgan from 'morgan'
require('dotenv').config()

const app: Application = express()
const port = 3001

app.use(cors())
app.use(morgan('dev'))

app.get('/', (req, res) => {
  res.send('Hello covidengineapi! test')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
