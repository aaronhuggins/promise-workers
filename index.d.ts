declare module 'promise-workers' {
  export class PromiseWorker extends Promise {
    constructor (executor: () => any | void)
    constructor (executor: () => any | void, workerData: any)
    constructor (executor: (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void)
    constructor (executor: (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void, workerData: any)

    static all(values: any[]): Promise<any[]>
    static allSettled(values: any[]): Promise<any[]>
    static race(not_implemented_or_recommended: never): Error
    static reject(reason: any): Promise<never>
    static resolve(value?: any): Promise<any>
  }

  export = { PromiseWorker }
}
