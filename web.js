const express = require('express')
const app = express()
const _ = require('lodash')
const { GoogleSpreadsheet } = require('google-spreadsheet')
require('dotenv').config()

const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID)
doc.useApiKey(process.env.GOOGLE_API_KEY)

app.get('/', async function (req, res, next) {
  await doc.loadInfo()
  const sheet = doc.sheetsByIndex[0]
  const rows = await sheet.getRows()
  const headers = rows[0]._sheet.headerValues

  const data = rows
    .map((row) => {
      return _.pick(row, headers)
    })
    .filter((row) => {
      return row.Name
    })

  res.json(data)
})

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found')
  err.status = 404
  next(err)
})

// error handlers
app.use(function (err, req, res, next) {
  err.status = err.status || 500
  res.status(err.status)

  const returnObj = {
    status: err.status,
    name: err.name,
    message: err.message
  }

  console.error(err)

  res.setHeader('Content-Type', 'application/json')
  res.json(returnObj)
})

module.exports = app
