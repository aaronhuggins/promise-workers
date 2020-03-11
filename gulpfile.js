const fs = require('fs')
const gulp = require('gulp')
const open = require('open')
const Mocha = require('mocha')
const lws = require('local-web-server')
const { PromiseWorker } = require('./index.js')

gulp.task('test:node', (done) => {
  new Mocha().addFile('./test/test.js').run(() => done())
})

gulp.task('test:web', () => {
  lws.create({ https: true, hostname: 'localhost' })

  open('https://localhost:8000/test/', { url: true })
})

gulp.task('test', gulp.series('test:node', 'test:web'))

gulp.task('compile:esm-test', async () => {
  const testScript = fs.readFileSync('./test/test.js', 'utf8')
  const esmTestScript = [
    'import { PromiseWorker } from \'../index.esm.js\'',
    ...testScript.split(/\r\n|\n|\r/).filter((line) => !line.includes('require('))
  ]

  fs.writeFileSync('./test/test-esm.js', esmTestScript.join('\n'), 'utf8')
})

gulp.task('compile:esm', async () => {
  fs.writeFileSync('./index.esm.js', `export ${PromiseWorker.toString()}\n`, 'utf8')
})
