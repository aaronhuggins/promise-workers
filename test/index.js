import { PromiseWorker } from '../web.js'

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

describe('class PromiseWorker', () => {
  it('should run sync function in thread', () => {
    return calculatePrimes(12).then((result) => {
      chai.expect(result).to.eql([2, 3, 5, 7, 11])
    })
  })

  it('should run async function in thread', () => {
    const msg = 'Darmok and Jalad at Tanagra.'
    return new PromiseWorker((resolve, reject) => {
      resolve(workerData)
    }, { workerData: msg }).then((result) => {
      chai.expect(result).to.eql(msg)
    })
  })
})
