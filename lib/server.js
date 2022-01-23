const http = require('http')
const v8 = require('v8')

const normalizePort = function (val) {
  const port = parseInt(val, 10)

  if (isNaN(port)) {
    // named pipe
    return val
  }

  if (port >= 0) {
    // port number
    return port
  }

  return false
}

module.exports.createServer = function (app, port, opts = {}) {
  // set app port
  app.set('port', normalizePort(port))

  // create server around
  const server = http.createServer(app)
  server.listen(port)

  // set timeout period
  const timeout = opts.timeout || (2 * 60 * 1000)
  server.setTimeout(timeout)

  // listen for specific issues
  server.on('error', function (err) {
    console.error('SERVER_ERROR', err)
    throw err
  })

  server.on('listening', function () {
    var addr = server.address()
    var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port
    console.log('SERVER_START', {
      bind: bind,
      memoryLimit: Math.round(v8.getHeapStatistics().heap_size_limit / 1000000),
      timeout: server.timeout
    })
  })

  const exit = function () {
    console.log('SERVER_EXIT')
    server.close(function () {
      process.exit(0)
    })
  }

  process.on('SIGINT', exit)
  process.on('SIGTERM', exit)

  return server
}
