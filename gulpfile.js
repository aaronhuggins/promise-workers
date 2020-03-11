const gulp = require('gulp')
const open = require('open')
const Mocha = require('mocha')
const lws = require('local-web-server')

gulp.task('test:node', async () => {
  new Mocha().addFile('./test/test.js').run(() => {})
})

gulp.task('test:web', () => {
  lws.create({ https: true, hostname: 'localhost' })

  open('https://localhost:8000/test/', { url: true })
})

gulp.task('test', gulp.series('test:node', 'test:web'))
