import express from 'express'
import cors from 'cors'
import morgan from 'morgan'

const app = express()
const port = 3001

app.use(cors())
app.use(morgan('dev'))
app.get('/', (req, res) => {
  res.send('Hello covidengineapi!')
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
