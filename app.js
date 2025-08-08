const express = require('express')

const app = express()

const port = 3000

app.get('/', function (req, res) {
  res.send('Hell!')
})

app.listen(port, function () {
  console.log(`Example app started! on port ${port}`)
})
