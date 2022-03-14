const PENDING = 'PENDING'
const FULFILLED = 'FULFILLED'
const REJECTED = 'REJECTED'

class MyPromise {
  constructor(executor) {
    this.status = PENDING
    this.value = undefined
    this.reason = undefined

    this.successCallbacks = []
    this.failCallbacks = []

    const resolve = (value) => {
      if (value instanceof MyPromise) {
        return value.then(resolve, reject)
      }
      
      if (this.status !== PENDING) return
      this.status = FULFILLED
      this.value = value

      while (this.successCallbacks.length) {
        this.successCallbacks.shift()()
      }
    }

    const reject = (reason) => {
      if (this.status !== PENDING) return
      this.status = REJECTED
      this.reason = reason

      while (this.failCallbacks.length) {
        this.failCallbacks.shift()()
      }
    }

    try {
      executor(resolve, reject)
    } catch (e) {
      this.reject(e)
    }
  }

  then(onSuccessCallback, onFailCallback) {
    onSuccessCallback = typeof onSuccessCallback === 'function' ? onSuccessCallback : (value) => value
    onFailCallback =
      typeof onFailCallback === 'function'
        ? onFailCallback
        : (reason) => {
            throw reason
          }
    const promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULFILLED) {
        setTimeout(() => {
          try {
            const x = onSuccessCallback(this.value)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            const x = onFailCallback(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else {
        this.successCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onSuccessCallback(this.value)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
        this.failCallbacks.push(() => {
          setTimeout(() => {
            try {
              const x = onFailCallback(this.reason)
              resolvePromise(promise2, x, resolve, reject)
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
      }
    })
    return promise2
  }

  catch(callback) {
    return this.then(undefined, callback)
  }

  finally(callback) {
    return this.then(
      (value) => {
        return MyPromise.resolve(callback()).then(() => value)
      },
      (reason) => {
        return MyPromise.resolve(callback()).then(() => {
          throw reason
        })
      }
    )
  }

  static resolve(value) {
    return new MyPromise((resolve) => {
      resolve(value)
    })
  }

  static reject(value) {
    return new MyPromise((_, reject) => {
      reject(value)
    })
  }

  static all(values) {
    if (!Array.isArray(values)) {
      const type = typeof values
      return new TypeError(`TypeError: ${type} ${values} is not iterable`)
    }

    return MyPromise((resolve, reject) => {
      let index = 0
      const result = []

      function addData(key, val) {
        index++
        result[key] = val

        if (index === values.length) {
          resolve(result)
        }
      }

      for (let i = 0; i < values.length; i++) {
        const current = values[i]
        if (current instanceof MyPromise) {
          current.then((value) => addData(i, value), reject)
        } else {
          addData(i, current)
        }
      }
    })
  }

  static race(values) {
    return new MyPromise((resolve, reject) => {
      for (let i = 0; i < values.length; i++) {
        const current = values[i]
        if (current instanceof MyPromise) {
          current.then(resolve, reject)
        } else {
          resolve(current)
        }
      }
    })
  }

  // static allSettled(values) {
  //   return new MyPromise((resolve) => {
  //     const result = []
  //     let index = 0
  //     function addData(key, val) {
  //       index++
  //       result[key] = val
  //       if (index === values.length) {
  //         resolve(result)
  //       }
  //     }
  //     for (let i = 0; i < values.length; i++) {
  //       const current = values[i]
  //       if (current instanceof MyPromise) {
  //         current.then(
  //           (value) => addData(i, { status: 'fulfilled', value }),
  //           (reason) => addData(i, { status: 'rejected', reason })
  //         )
  //       } else {
  //         addData(i, { status: 'fulfilled', value: current })
  //       }
  //     }
  //   })
  // }
}

MyPromise.defer = MyPromise.deferred = function () {
  let dtd = {}
  dtd.promise = new MyPromise((resolve, reject) => {
    dtd.resolve = resolve
    dtd.reject = reject
  })
  return dtd
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  let called
  if ((typeof x === 'object' && x != null) || typeof x === 'function') {
    try {
      let then = x.then
      if (typeof then === 'function') {
        then.call(
          x,
          (y) => {
            if (called) return
            called = true
            resolvePromise(promise2, y, resolve, reject)
          },
          (r) => {
            if (called) return
            called = true
            reject(r)
          }
        )
      } else {
        resolve(x)
      }
    } catch (e) {
      if (called) return
      called = true
      reject(e)
    }
  } else {
    resolve(x)
  }
}

module.exports = MyPromise
