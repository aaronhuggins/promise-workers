export class PromiseWorker<T> implements Promise<T> {
  constructor (
    executor: (
      resolve: (value?: unknown) => void,
      reject: (reason?: any) => void
    ) => void,
    options: PromiseWorkerOptions
  ) {
    const { workerData } = this._internalOptions = options
    const self = this

    this._internalPromise = new Promise(function (resolve, reject) {
      if (typeof window === 'undefined') {
        self._internalScript =
          'const workerThreads = require(\'worker_threads\')\n' +
          'const workerData = workerThreads.workerData\n' +
          'new Promise(' + executor.toString() + ')\n' +
          '  .then(function (result) {\n' +
          '    workerThreads.parentPort.postMessage(result)\n' +
          '  })\n' +
          '  .catch(function (error) {\n' +
          '    workerThreads.parentPort.postMessage(error)\n' +
          '  })'
        const { Worker } = require('worker_threads')
        self._internalWorker = new Worker(
          self._internalScript,
          {
            ...self._internalOptions,
            eval: true
          }
        )

        self._internalWorker.addListener('message', function (data: T) {
          self._internalWorker.terminate()
          resolve(data)
        }).addListener('error', function (error: any) {
          self._internalWorker.terminate()
          resolve(error)
        }).addListener('exit', function (exitCode: number) {
          if (exitCode !== 0) {
            reject(new Error(`Worker stopped with exit code ${exitCode}`))
          }
        })
      } else {
        self._internalScript =
          'onmessage = function (event) {\n' +
          '  const workerData = event.data\n' +
          '  new Promise(' + executor.toString() + ')\n' +
          '    .then(function (result) {\n' +
          '      postMessage(result)\n' +
          '    })\n' +
          '    .catch(function (error) {\n' +
          '      postMessage(error)\n' +
          '    })\n' +
          '}'
        self._internalWorker = new window.Worker(
          window
            .URL
            .createObjectURL(
              new window.Blob(
                [self._internalScript],
                { type: 'application/js' }
              )
            ),
          self._internalOptions as WorkerOptions
        )

        self._internalWorker.onmessage = function onmessage (event: MessageEvent) {
          self._internalWorker.terminate()
          resolve(event.data)
        }
        self._internalWorker.onerror = function onerror (event: ErrorEvent) {
          self._internalWorker.terminate()
          reject(event)
        }
        self._internalWorker.onmessageerror = function onmessageerror (event: ErrorEvent) {
          self._internalWorker.terminate()
          reject(event)
        }
        self._internalWorker.postMessage(workerData)
      }
    })
  }

  private _internalPromise: Promise<T>
  private _internalWorker: Worker | any
  private _internalScript: string
  private _internalOptions: PromiseWorkerOptions

  get [Symbol.toStringTag] (): string {
    return 'PromiseWorker'
  }

  then <R1 = T, R2 = never> (
    onFulfilled?: (value: T) => R1 | PromiseLike<R1>,
    onRejected?: (reason: any) => R2 | PromiseLike<R2>
  ): Promise<R1 | R2> {
    return this._internalPromise.then(onFulfilled, onRejected)
  }

  catch(onRejected?: (reason: any) => PromiseLike<never>): Promise<T> {
    return this._internalPromise.catch(onRejected)
  }

  finally (onFinally?: () => void): Promise<T> {
    return this._internalPromise.finally(onFinally)
  }

  static get [Symbol.species] (): PromiseConstructor {
    return Promise
  }

  static all(values: readonly any[]): Promise<any[]> {
    return Promise.all(values)
  }

  static allSettled(values: readonly any[]): Promise<any[]> {
    if (typeof (Promise as any).allSettled === 'undefined') {
      return PromiseWorker.all(values)
    }

    return (Promise as any).allSettled(values)
  }

  static race(not_implemented_or_recommended: never): Error {
    throw new Error('Not implemented or recommended; manually call Promise.race() to ignore this error.')
  }

  static reject(reason: any): Promise<never> {
    return Promise.reject(reason)
  }

  static resolve(value?: any): Promise<any> {
    return Promise.resolve(value)
  }
}

export interface PromiseWorkerOptions {
  workerData?: any,
  [option: string]: any
}
