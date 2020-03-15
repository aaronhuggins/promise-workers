let counter = 0

export const PENDING   : number = void 0
export const FULFILLED : number = 1
export const REJECTED  : number = 2

export class PromiseWorker<T> implements Promise<any> {
  constructor (
    executor: (
      resolve: (value?: unknown) => void,
      reject: (reason?: any) => void
    ) => void,
    workerData: any
  ) {
    this._id = counter++
    this._state = undefined
    this._result = undefined
    this._subscribers = []
  }

  private _id: number
  private _state: number
  private _result: any
  private _subscribers: any[]

  then (
    onFulfilled?: (value: any) => PromiseLike<any>,
    onRejected?: (reason: any) => PromiseLike<never>
  ): Promise<any> {
    let parent = this;
    let state = parent._state;

    if (state === FULFILLED && !onFulfillment || state === REJECTED && !onRejection) {
      config.instrument && instrument('chained', parent, parent);
      return parent;
    }

    parent._onError = null;

    let child = new parent.constructor(noop, label);
    let result = parent._result;
  
    config.instrument && instrument('chained', parent, child);
  
    if (state === PENDING) {
      subscribe(parent, child, onFulfillment, onRejection);
    } else {
      let callback = state === FULFILLED ? onFulfillment : onRejection;
      config.async(() => invokeCallback(state, child, callback, result));
    }
  
    return child;
  }

  catch (onRejected?: (reason: any) => PromiseLike<never>): Promise<any> {
    return this.then(undefined, onRejected)
  }

  finally (onFinally?: () => PromiseLike<never>): Promise<any> {
    let promise = this
    let constructor = promise.constructor;

    if (typeof onFinally === 'function') {
      return promise.then(value => constructor.resolve(onFinally()).then(() => value),
                         reason => constructor.resolve(onFinally()).then(() => { throw reason; }));
    }

    return promise.then(onFinally, onFinally);
  }

  static all(values: any[]): Promise<any[]> {
    return
  }

  static allSettled(values: any[]): Promise<any[]> {
    return
  }

  static race(not_implemented_or_recommended: never): Error {
    return
  }

  static reject(reason: any): Promise<never> {
    return
  }

  static resolve(value?: any): Promise<any> {
    return
  }
}
  