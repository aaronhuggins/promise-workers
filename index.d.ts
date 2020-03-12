declare module 'promise-workers' {
  export class PromiseWorker extends Promise {
    constructor (executor: () => any | void)
    constructor (executor: () => any | void, workerData: any)
    constructor (executor: (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void)
    constructor (executor: (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void, workerData: any)
  }

  export = { PromiseWorker }
}
