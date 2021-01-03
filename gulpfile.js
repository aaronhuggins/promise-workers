const fs = require('fs')
const gulp = require('gulp')
const open = require('open')
const Mocha = require('mocha')
const shell = require('gulp-shell')
const lws = require('local-web-server')
const sleep = ms => new Promise(res => setTimeout(res, ms))

gulp.task('test:node', (done) => {
  new Mocha().addFile('./test/test.js').run(() => done())
})

gulp.task('test:web', async () => {
  const connections = []
  const ws = lws.create({ https: true, hostname: 'localhost' })

  ws.server.on('connection', connection => connections.push(connection))

  await open('https://localhost:8000/test/', { url: true })

  await sleep(5000)
  ws.server.close()
  connections.forEach(connection => connection.destroy())
})

gulp.task('compile:esm-test', async () => {
  const testScript = fs.readFileSync('./test/test.js', 'utf8')
  const esmTestScript = [
    'import { PromiseWorker } from \'../esm/index.js\'',
    ...testScript.split(/\r\n|\n|\r/).filter((line) => !line.includes('require('))
  ]

  fs.writeFileSync('./test/test-web.js', esmTestScript.join('\n'), 'utf8')
})

gulp.task('test', gulp.series('test:node', 'compile:esm-test', 'test:web'))

gulp.task('compile:tsc', shell.task([
  'tsc',
  'tsc -p tsconfig.esm.json'
]))

gulp.task('compile', gulp.parallel('compile:tsc', 'compile:esm-test'))
