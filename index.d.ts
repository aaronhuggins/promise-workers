declare module 'promise-workers' {
  class PromiseWorker extends Promise {
    constructor (executor: () => any | void)
    constructor (executor: () => any | void, input: { workerData: any })
    constructor (executor: (workerData: any) => any | void)
    constructor (executor: (workerData: any) => any | void, input: { workerData: any })
    constructor (executor: (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void)
    constructor (executor: (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void, input: { workerData: any })
  }

  export = { PromiseWorker }
}
