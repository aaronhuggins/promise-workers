class PromiseWorker extends Promise {
  constructor (executor, { workerData } = {}) {
    let Worker
    let workerFunc = `
      if (typeof postMessage === 'undefined') {
        const workerThreads = require('worker_threads')
        const workerData = workerThreads.workerData
        workerThreads.parentPort.postMessage((${executor.toString()})(workerData))
      } else {
        onmessage = function (event) {
          const workerData = event.data
          postMessage((${executor.toString()})(workerData))
        }
      }`

    if (executor.length === 2) {
      workerFunc = `
      if (typeof postMessage === 'undefined') {
        const workerThreads = require('worker_threads')
        const workerData = workerThreads.workerData
        new Promise(${executor.toString()})
          .then(function (result) {
            workerThreads.parentPort.postMessage(result)
          })
          .catch(function (error) {
            workerThreads.parentPort.postMessage(error)
          })
      } else {
        onmessage = function (event) {
          const workerData = event.data
          new Promise(${executor.toString()})
            .then(function (result) {
              postMessage(result)
            })
            .catch(function (error) {
              postMessage(error)
            })
        }
      }`
    }

    if (typeof window === 'undefined') {
      const workerThreads = require('worker_threads')
      Worker = workerThreads.Worker
    } else {
      Worker = window.Worker
      workerFunc = window.URL.createObjectURL(new window.Blob([workerFunc], { type: 'application/js' }))
    }

    super(function (resolve, reject) {
      const worker = new Worker(workerFunc, { workerData, eval: true })
      if (typeof worker.on === 'undefined') {
        worker.onmessage = function onmessage (event) {
          resolve(event.data)
          worker.terminate()
        }
        worker.onerror = function onerror (event) {
          reject(event)
          worker.terminate()
        }
        worker.onmessageerror = function onmessageerror (event) {
          reject(event)
          worker.terminate()
        }
        worker.postMessage(workerData)
      } else {
        worker.on('message', function (data) {
          resolve(data)
          worker.terminate()
        })
        worker.on('error', function (error) {
          resolve(error)
          worker.terminate()
        })
        worker.on('exit', function (exitCode) {
          if (exitCode !== 0) {
            reject(new Error(`Worker stopped with exit code ${exitCode}`))
          }
        })
      }
    })
  }

  static get [Symbol.species] () {
    return Promise
  }

  get [Symbol.toStringTag] () {
    return 'PromiseWorker'
  }
}

module.exports = { PromiseWorker }
