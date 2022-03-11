const MyPromise = require('./MyPromise.js')

// const p1 = new MyPromise((resolve, reject) => {
//   // resolve('成功')
//   // reject('失败')
//   // setTimeout(() => {
//   // }, 2000);
//   resolve('成功')
// })

// p1.then((value) => {
//   console.log(111);
//   console.log(value)
// }, (reason) => {
//   console.log(222);
//   console.log(reason);
// })
let p2 = new MyPromise((resolve, reject) => {
  // throw new Error('执行器错误')
  setTimeout(() => {
    resolve(100)
  }, 2000);
})
let p1 = new MyPromise((resolve, reject) => {
  resolve(200)
})

MyPromise.all(['a', 'b', p1, p2, 'c']).then(val => {
  console.log(val);
}, reason => {
  console.log(reason);
})