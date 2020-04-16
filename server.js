const express = require('express')
const app = express()

app.get('/', (req, res) => {
  res.send(process.env)
})

app.listen(process.env.PORT || 3000, () => {
  console.log(`App runing at port ${process.env.PORT || 3000}`)
})
