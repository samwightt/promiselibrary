import { wrapPromise, cancelPromise } from './module_test'

const [cancelKey, returnPromise] = wrapPromise((setCancelCallback): Promise<string> =>
  new Promise((resolve) => {
    console.log("We're in the promise!")

    const cancelNum = setTimeout(() => resolve("We resolved the promise!"), 2000)

    setCancelCallback(() => {
      console.log("The promise was cancelled!")
      clearTimeout(cancelNum)
    })
  }))

returnPromise.then(data => console.log(data))

setTimeout(() => cancelPromise(cancelKey), 1000)