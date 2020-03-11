const fs = require('fs')
const { PromiseWorker } = require('./index.js')

fs.writeFileSync('./web.js', `export ${PromiseWorker.toString()}\n`, 'utf8')
