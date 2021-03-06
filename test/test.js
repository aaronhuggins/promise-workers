const chai = require('chai')
const { PromiseWorker } = require('../index.js')

const calculatePrimes = function calculatePrimes (max) {
  return new PromiseWorker(function (resolve, reject) {
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

    resolve(primes)
  }, { workerData: max })
}

describe('class PromiseWorker', () => {
  it('should run async function in thread', () => {
    const msg = 'Darmok and Jalad at Tanagra.'

    return new PromiseWorker((resolve, reject) => {
      resolve(workerData)
    }, { workerData: msg }).then((result) => {
      chai.expect(result).to.eql(msg)
    })
  })

  it('should run pool of async workers', () => {
    const maxValues = [
      21999917,
      11,
      10993,
      1999891,
      11999989
    ]

    return PromiseWorker.all(maxValues.map((maxValue) => calculatePrimes(maxValue)))
      .then((results) => {
        const result = results.map((values) => values[values.length - 1])

        chai.expect(result).to.eql(maxValues)
      })
  }).timeout(3500)
})
