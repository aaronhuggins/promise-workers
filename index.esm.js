export class PromiseWorker extends Promise {
  constructor (executor, workerData) {
    super(function (resolve, reject) {
      if (typeof window === 'undefined') {
        const workerFunc = executor.length === 2
          ? 'const workerThreads = require(\'worker_threads\')\n' +
            'const workerData = workerThreads.workerData\n' +
            'new Promise(' + executor.toString() + ')\n' +
            '  .then(function (result) {\n' +
            '    workerThreads.parentPort.postMessage(result)\n' +
            '  })\n' +
            '  .catch(function (error) {\n' +
            '    workerThreads.parentPort.postMessage(error)\n' +
            '  })'
          : 'const workerThreads = require(\'worker_threads\')\n' +
            'const workerData = workerThreads.workerData\n' +
            'workerThreads.parentPort.postMessage((' + executor.toString() + ')())'
        const { Worker } = require('worker_threads')
        const worker = new Worker(
          workerFunc,
          { workerData, eval: true }
        )

        worker.addListener('message', function (data) {
          worker.terminate()
          resolve(data)
        }).addListener('error', function (error) {
          worker.terminate()
          resolve(error)
        }).addListener('exit', function (exitCode) {
          if (exitCode !== 0) {
            reject(new Error(`Worker stopped with exit code ${exitCode}`))
          }
        })
      } else {
        const workerFunc = executor.length === 2
          ? 'onmessage = function (event) {\n' +
            '  const workerData = event.data\n' +
            '  new Promise(' + executor.toString() + ')\n' +
            '    .then(function (result) {\n' +
            '      postMessage(result)\n' +
            '    })\n' +
            '    .catch(function (error) {\n' +
            '      postMessage(error)\n' +
            '    })\n' +
            '}'
          : 'onmessage = function (event) {\n' +
            '  const workerData = event.data\n' +
            '  postMessage((' + executor.toString() + ')())\n' +
            '}'
        const worker = new window.Worker(
          window
            .URL
            .createObjectURL(
              new window.Blob(
                [workerFunc],
                { type: 'application/js' }
              )
            )
        )

        worker.onmessage = function onmessage (event) {
          worker.terminate()
          resolve(event.data)
        }
        worker.onerror = function onerror (event) {
          worker.terminate()
          reject(event)
        }
        worker.onmessageerror = function onmessageerror (event) {
          worker.terminate()
          reject(event)
        }
        worker.postMessage(workerData)
      }
    })
  }

  static all (values) {
    return Promise.all(values)
  }

  static allSettled (values) {
    return Promise.allSettled(values)
  }

  static race () {
    throw new Error('Not implemented or recommended; manually call Promise.race() to ignore this error.')
  }

  static reject(reason) {
    return Promise.reject(reason)
  }

  static resolve(value) {
    return Promise.resolve(value)
  }

  static get [Symbol.species] () {
    return Promise
  }

  get [Symbol.toStringTag] () {
    return 'PromiseWorker'
  }
}
