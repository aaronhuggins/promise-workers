const fs = require('fs')
const gulp = require('gulp')
const open = require('open')
const Mocha = require('mocha')
const shell = require('gulp-shell')
const lws = require('local-web-server')

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
    'import { PromiseWorker } from \'../esm/index.js\'',
    ...testScript.split(/\r\n|\n|\r/).filter((line) => !line.includes('require('))
  ]

  fs.writeFileSync('./test/test-web.js', esmTestScript.join('\n'), 'utf8')
})

gulp.task('compile:tsc', shell.task([
  'tsc',
  'tsc -p tsconfig.esm.json'
]))

gulp.task('compile', gulp.parallel('compile:tsc', 'compile:esm-test'))
