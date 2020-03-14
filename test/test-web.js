
const calculatePrimes = function calculatePrimes (max) {
  return new PromiseWorker(function () {
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
  }, max)
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
    }, msg).then((result) => {
      chai.expect(result).to.eql(msg)
    })
  })

  it('should run pool of async workers', () => {
    const maxValues = [
      21999917,
      10993,
      11,
      1999891,
      21999917,
      10993,
      1999891,
      11999989,
      11,
      11999989
    ]

    return PromiseWorker.all(maxValues.map((maxValue) => calculatePrimes(maxValue)))
      .then((results) => {
        const result = results.map((values) => values[values.length - 1])

        chai.expect(result).to.eql(maxValues)
      })
  }).timeout(3500)
})
