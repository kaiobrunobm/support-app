import express from 'express'
import os from 'node:os'

const app = express()
const port = process.env.PORT || 3000

app.get('/', (req, res) => {
  res.send(console.log('Hello world'))
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
