const { PromiseWorker } = require('./index.js')

const calculatePrimes = function calculatePrimes (max) {
  return new PromiseWorker(function (workerData) {
    const max = workerData
    const store = []
    const primes = []

    for (let i = 2; i <= max; i++) {
      if (!store[i]) {
        primes.push(i)
        for (let j = i << 1; j <= max; j += i) {
          store[j] = true
        }
      }
    }

    return primes
  }, { workerData: max })
}

async function main () {
  try {
    const result = await calculatePrimes(30000000)

    console.log(result)
  } catch (error) {
    console.log(error)
  }
}

main()
