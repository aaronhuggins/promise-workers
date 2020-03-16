# Promise Workers

Promises and Async/Await patterns have greatly improved multi-tasking in JavaScript. With the inroduction of Web Workers and Node.JS Worker Threads marked as stable, true multi-threading has become a cross-platform reality as well. This library aims to combine `Promise` and `Worker` dynamically to provide single-task, easy-to-use asynchrony, and pooling (using `PromiseWorker.all`) for threads.

## Usage

The library is usable in browsers and Node.JS. There are some differences which are [explained below](#supported-platforms-and-differences).

- Node.JS: `const { PromiseWorker } = require('promise-workers')`
- Tree-shaking with ESM: `import { PromiseWorker } from 'promise-workers/index.esm.js'`
- Browser: `<script src="https://cdn.jsdelivr.net/npm/promise-workers@1.2.0/index.min.js"></script>`

```javascript
function workToDo (input) {
  return new PromiseWorker(function () {
    const data = workerData // Variable workerData is assigned as a constant in the worker context.

    // Perform CPU intensive work...

    return data
  }, { workerData: input })
}

async function main () {
  try {
    const result = await workToDo(300)

    console.log(result)
  } catch (error) {
    console.log(error)
  }
}

main()
// ... Do other work
```

## API

The `PromiseWorker` constructor accepts two arguments.
- `executor`: **Required** The function passed to the worker for execution.
- `workerData`: **Optional** Any JavaScript value which will be cloned to the worker as a local `workerData` variable.

The `executor` function should be written as if it is self-contained code. It will be executed in the context of the worker and will only have access to the context of its own thread. The variable `workerData` is initialized as a constant in the worker context and cannot be re-assigned by the `executor` function. The `executor` function cannot reference anything from the thread that spawns the `PromiseWorker`.

### new PromiseWorker(executor: () => any | void)

Creates a worker with a synchronous function.

### new PromiseWorker(executor: () => any | void, workerData: any)

Creates a worker with a synchronous function; passes data to the local context as `const workerData`.

### new PromiseWorker(executor: (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void)

Creates a worker with a Promise to fulfill.

### new PromiseWorker(executor: (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void, workerData: any)

Creates a worker with a Promise to fulfill; passes data to the local context as `const workerData`.

### PromiseWorker.all(values: any[]): Promise<any[]>

Calls `Promise.all` for convenience and Promise API completeness.

### PromiseWorker.allSettled(values: any[]): Promise<any[]>

Calls `Promise.allSettled` for convenience and Promise API completeness.

### PromiseWorker.race(not_implemented_or_recommended: never): Error

Method set on `PromiseWorker` to throw an error alerting users to avoid. See [StackExchange thread on multi-threading pitfalls](https://softwareengineering.stackexchange.com/questions/81003/how-to-explain-why-multi-threading-is-difficult) for great discussion and insight on why racing threads is bad. Although the other executing PromiseWorkers *should* terminate gracefully, insight into those other threads is lost and it becomes difficult to determine if those threads have been handled in a stable manner. If you **really do** wish to circumvent this, just call `Promise.race` directly.

### PromiseWorker.reject(reason: any): Promise<never>

Calls `Promise.reject` for convenience and Promise API completeness.

### PromiseWorker.resolve(value?: any): Promise<any>

Calls `Promise.resolve` for convenience and Promise API completeness.

## Supported Platforms and Differences

Web browsers and Node are supported by this library. This is limited to the availability and implementation of class `Worker` on each platform.This library has been tested working in Chrome 80.0.3987.132, Firefox 68.6.0esr, and Edge 44.18362.449.0.

### Difference In Behavior
|Platform|Versions|Async Function Resolve Value|Sync Function Resolve Value|Reject Error|
|--------|--------|----------------------------|---------------------------|------------|
|Node|`12.x`, `13.x`|The value passed to `resolve()`|The function return value|Value passed to `reject()` or a JS `Error`|
|Browser|[See MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)|The value passed to `resolve()`\*|The function return value\*|An `ErrorEvent` object|

### Differences In Features
|*Feature*|Node|Browser|
|---------|----|-------|
|Functions and Classes|[Node Docs](https://nodejs.org/api/worker_threads.html#worker_threads_class_worker)|[MDN Docs](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Functions_and_classes_available_to_workers)|
|Worker constructor|Executable code is passed as a string|Code is stringified and turned into a Blob URL|
|PromiseWorker runtime|`workerData` is passed directly in constructor|`worker.postMessage()` is used to pass `workerData` to the thread|

## Contributors

- Aaron Huggins
