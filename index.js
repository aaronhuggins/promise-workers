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
          .then((result) => {
            workerThreads.parentPort.postMessage(result)
          })
          .catch((error) => {
            workerThreads.parentPort.postMessage(error)
          })
      } else {
        onmessage = function (event) {
          const workerData = event.data
          new Promise(${executor.toString()})
            .then((result) => {
              postMessage(result)
            })
            .catch((error) => {
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

    super((resolve, reject) => {
      const worker = new Worker(workerFunc, { workerData, eval: true })
      const exitCode = (code) => {
        if (code !== 0) {
          reject(new Error(`Worker stopped with exit code ${code}`))
        }
      }
      if (typeof worker.on === 'undefined') {
        worker.onmessage = (event) => { resolve(event.data) }
        worker.onerror = (event) => { reject(event) }
        worker.onmessageerror = (event) => { reject(event) }
        worker.postMessage(workerData)
      } else {
        worker.on('message', resolve)
        worker.on('error', reject)
        worker.on('exit', exitCode)
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
