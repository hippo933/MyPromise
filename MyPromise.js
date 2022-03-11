/**
 * 1. Promise 就是一个类 在执行这个类的时候需要传递一个执行器进去 执行器会立即执行
 * 2. Promise 汇总有个三种状态 分别为 成功 fulfilled 失败 rejected 等待 pending
 *    pending -> fulilled
 *    pendign -> rejected
 * 3. resolve 和reject 函数是用来改变状态的
 *    resolve: fulilled
 *    reject: rejected
 *    状态不可逆
 * 4. then方法内部做的事情就判断状态如果状态是成功 调用成功的回调函数 如果状态是失败 调用失败回调
 * 5. then成功回调有一个参数表示成功之后的值 then失败回调有一个参数表示失败后的原因
 */

const PENDING = 'pending'
const FULILLED = 'fulilled'
const REJECTED = 'rejected'

class MyPromise {
  status = PENDING
  value = undefined
  reason = undefined
  successCallbacks = []
  failCallbacks = []

  constructor(exectuor) {
    try {
      exectuor(this.resolve, this.reject)
    } catch (e) {
      this.reject(e)
    }
  }

  resolve = (value) => {
    // 如果状态不是 pending 阻止程序继续运行
    if (this.status !== PENDING) return
    // 状态改为成功
    this.status = FULILLED
    this.value = value
    while (this.successCallbacks.length) {
      this.successCallbacks.shift()(this.value)
    }
  }

  reject = (reason) => {
    // 如果状态不是 pending 阻止程序继续运行
    if (this.status !== PENDING) return
    // 状态改为成功
    this.status = REJECTED
    this.reason = reason
    while (this.failCallbacks.length) {
      this.failCallbacks.shift()(this.reason)
    }
  }

  then(onSuccessCallback, onFailCallback) {
    // 如果没有传递成功或者失败的回调 就把当前的结果传递给下一个Promise
    onSuccessCallback = onSuccessCallback ? onSuccessCallback : value => value
    onFailCallback = onFailCallback ? onFailCallback : reason => {throw reason}

    let promise2 = new MyPromise((resolve, reject) => {
      if (this.status === FULILLED) {
        setTimeout(() => {
          try {
            let x = onSuccessCallback(this.value)
            resolvePromise(promise2, x, resolve, reject) 
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else if (this.status === REJECTED) {
        setTimeout(() => {
          try {
            let x = onFailCallback(this.reason)
            resolvePromise(promise2, x, resolve, reject)
          } catch (e) {
            reject(e)
          }
        }, 0)
      } else {
        // 等待状态
        // 将成功回调和失败回调先存起来
        this.successCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onSuccessCallback(this.value)
              resolvePromise(promise2, x, resolve, reject) 
            } catch (e) {
              reject(e)
            }
          }, 0)
        })
        this.failCallbacks.push(() => {
          setTimeout(() => {
            try {
              let x = onFailCallback(this.reason)
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

  static all(array) {
    return new MyPromise((resolve, reject) => {

      const result = []
      let index = 0
      function addData(key, value) {
        index++
        result[key] = value
        if (index === array.length) {
          resolve(result)
        }
      }
      for (let i = 0; i < array.length; i++) {
        const current = array[i]
        if (current instanceof MyPromise) {
          // promise对象
          current.then(value => addData(i, value), reason => reject(reason))
        } else {
          // 普通值
          addData(i, current)
        }
      }
    })
  }
}

function resolvePromise(promise2, x, resolve, reject) {
  if (promise2 === x) {
    // 防止
    return reject(new TypeError('Chaining cycle detected for promise #<Promise>'))
  }
  if (x instanceof MyPromise) {
    // promise对象
    x.then(resolve, reject)
  } else {
    // 普通值
    resolve(x)
  }
}

module.exports = MyPromise
