export class PromiseWorker<T = any> implements Promise<T> {
  constructor (
    executor: (
      resolve: (value?: unknown) => void,
      reject: (reason?: any) => void
    ) => void,
    options: PromiseWorkerOptions
  ) {
    const { workerData } = this._internalOptions = options
    const thisRef = this
    try {
      // Attempt a pre-import of optional `tslib` to cache ahead of calls made by typescript later.
      require('tslib')
    } catch (err) {}

    this._internalPromise = new Promise(function (resolve, reject) {
      if (typeof window === 'undefined') {
        thisRef._internalScript =
          'let tslib = {}\n' +
          'try {\n' +
          '  tslib = require(\'tslib\')\n' +
          '} catch (err) {}\n' +
          'const { __importStar, __importDefault } = tslib\n' +
          'const workerThreads = require(\'worker_threads\')\n' +
          'const workerData = workerThreads.workerData\n' +
          'new Promise(' + executor.toString() + ')\n' +
          '  .then(function (result) {\n' +
          '    workerThreads.parentPort.postMessage(result)\n' +
          '  })\n' +
          '  .catch(function (error) {\n' +
          '    workerThreads.parentPort.postMessage({ __promise_worker_error: error })\n' +
          '  })'
        const { Worker } = require('worker_threads')
        thisRef._internalWorker = new Worker(
          thisRef._internalScript,
          {
            ...thisRef._internalOptions,
            eval: true
          }
        )

        thisRef._internalWorker.addListener('message', function (data: T | PromiseWorkerError) {
          thisRef._internalWorker.terminate()
          if (typeof (data as PromiseWorkerError).__promise_worker_error === 'undefined') {
            resolve(data as T)
          } else {
            reject((data as PromiseWorkerError).__promise_worker_error)
          }
        }).addListener('error', function (error: any) {
          thisRef._internalWorker.terminate()
          resolve(error)
        }).addListener('exit', function (exitCode: number) {
          if (exitCode !== 0) {
            reject(new Error(`Worker stopped with exit code ${exitCode}`))
          }
        })
      } else {
        thisRef._internalScript =
          'onmessage = function (event) {\n' +
          '  const workerData = event.data\n' +
          '  new Promise(' + executor.toString() + ')\n' +
          '    .then(function (result) {\n' +
          '      postMessage(result)\n' +
          '    })\n' +
          '    .catch(function (error) {\n' +
          '      postMessage({ __promise_worker_error: error })\n' +
          '    })\n' +
          '}'
        thisRef._internalWorker = new window.Worker(
          window
            .URL
            .createObjectURL(
              new window.Blob(
                [thisRef._internalScript],
                { type: 'application/js' }
              )
            ),
          thisRef._internalOptions as WorkerOptions
        )

        thisRef._internalWorker.onmessage = function onmessage (event: MessageEvent) {
          thisRef._internalWorker.terminate()
          if (typeof (event.data as PromiseWorkerError).__promise_worker_error === 'undefined') {
            resolve(event.data as T)
          } else {
            reject((event.data as PromiseWorkerError).__promise_worker_error)
          }
        }
        thisRef._internalWorker.onerror = function onerror (event: ErrorEvent) {
          thisRef._internalWorker.terminate()
          reject(event)
        }
        thisRef._internalWorker.onmessageerror = function onmessageerror (event: ErrorEvent) {
          thisRef._internalWorker.terminate()
          reject(event)
        }
        thisRef._internalWorker.postMessage(workerData)
      }
    })
  }

  protected _internalPromise: Promise<T>
  protected _internalWorker: Worker | any
  protected _internalScript: string
  protected _internalOptions: PromiseWorkerOptions

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

  static all<A = any>(values: readonly (A | Promise<A>)[]): Promise<A[]> {
    return Promise.all(values)
  }

  static allSettled<A = any>(values: readonly (A | Promise<A>)[]): Promise<A[]> {
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

  static resolve<A = any>(value?: A | Promise<A>): Promise<A> {
    return Promise.resolve(value)
  }
}

export interface PromiseWorkerOptions<T = any> {
  workerData?: T,
  [option: string]: any
}

export interface PromiseWorkerError {
  __promise_worker_error: any
}
