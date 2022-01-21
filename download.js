#!/usr/bin/env node --max-old-space-size=8096
const Promise = require('bluebird')
const _ = require('lodash')
const request = Promise.promisify(require('request'))
const fs = Promise.promisifyAll(require('fs'))
const path = require('path')
const sharp = require('sharp')

const COLLECTION_NAME = 'rubberduckz'
const OPENSEA_API_URL = 'https://api.opensea.io/api/v1'
const ASSET_CONTRACT_ADDRESS = '0xa5e25b44b01e09b7455851838c76cde68d13e29f'
const IPFS_BASE_URL = 'https://ipfs.io/ipfs/QmYvVbCBiGHfiL1RUrVCupX2MrxkikogSSsQYcKhKyovwp'

const resizeImage = async function (buffer) {
  return await sharp(buffer).resize(200).toBuffer()
}

const downloadImage = async function (url) {
  const req = {
    method: 'GET',
    url,
    encoding: null
  }

  const resp = await request(req)

  return resp.body
}

const getOpenSeaData = async function (id) {
  const req = {
    method: 'GET',
    url: `${OPENSEA_API_URL}/asset/${ASSET_CONTRACT_ADDRESS}/${id}`,
    qs: {
      format: 'json'
    },
    headers: {
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.71 Safari/537.36'
    },
    json: true
  }

  const resp = await request(req)

  const photoUrl = _.get(resp.body, 'image_original_url')

  console.log({
    statusCode: resp.statusCode,
    photoUrl
  })

  return photoUrl
}

const saveImage = async function (filename, data) {
  return fs.writeFileAsync(path.join(__dirname, 'images', `${filename}.jpg`), data)
}

const getAndSaveDuck = async function (id) {
  // const photoUrl = await getOpenSeaData(id)
  const photoUrl = `${IPFS_BASE_URL}/${id}.jpeg`
  const imageData = await downloadImage(photoUrl)
  const resizedImageData = await resizeImage(imageData)
  await saveImage(_.padStart(id, 4, '0'), resizedImageData)
}

Promise
  .resolve()
  .then(function () {
    return fs.readdirAsync(path.join(__dirname, 'images'))
  })
  .then(function (files) {
    return _.range(1, 2001)
    // return _.differenceBy(_.range(1, 2001), files, function (i) {
    //   if (typeof i === 'string') {
    //     return i
    //   }

    //   return `${_.padStart(i, 4, '0')}.jpg`
    // })
  })
  .map(function (i) {
    console.log(i)
    return Promise.resolve(getAndSaveDuck(i))
  }, {
    concurrency: 2
  })
