# Promise Workers

Promises and Async/Await patterns have greatly improved multi-tasking in JavaScript. With the inroduction of Web Workers and Node.JS Worker Threads, true multi-threading became a reality as well. This library aims to combine these two dynamically to provide easy-to-use asynchrony as class `PromiseWorker` and pooling using `Promise.all` for threads.

## Usage

The library is usable in browsers and Node.JS. There are some differences which are explained below.

- Node.JS: `const { PromiseWorker } = require('promise-workers')`
- Browser: `<script type="module" src="web.js"></script>`
- Tree-shaking: `import { PromiseWorker } from 'promise-workers/web.js'`

```javascript
function workToDo (input) {
  return new PromiseWorker(function (workerData) {
    const data = workerData

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

### `new PromiseWorker(executor: () => any | void)`

### `new PromiseWorker(executor: () => any | void, input: { workerData: any })`

### `new PromiseWorker(executor: (workerData: any) => any | void)`

### `new PromiseWorker(executor: (workerData: any) => any | void, input: { workerData: any })`

### `new PromiseWorker(executor: (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void)`

### `new PromiseWorker(executor: (resolve: (value?: unknown) => void, reject: (reason?: any) => void) => void, input: { workerData: any })`

## Supported Platforms and Differences

Web browsers and Node are supported by this library. This is limited to the availability and implementation of Workers on each platform.

|Platform|Versions|Async Function Resolve Value|Sync Function Resolve Value|Reject Error|
|--------|--------|----------------------------|---------------------------|------------|
|Node|`12.x`, `13.x`|The value passed to `resolve()`|The function return value|Value passed to `reject()` or a JS `Error`|
|Browser|[See MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/Worker/Worker)|The value passed to `resolve()`\*|The function return value\*|An `ErrorEvent` object|
