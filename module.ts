import randomstring from 'randomstring'
export type CancelType = (func: () => any) => any

interface CallbackTableType<T> {
  [key: string]: T
}

let reserveTable: CallbackTableType<string> = {}

let callbackTable: CallbackTableType<() => void> = {}

const wrapPromise = <T>(func: (setCancelCallback: CancelType) => Promise<T>): [string, Promise<T>] => {
  let cancelKey = randomstring.generate({ length: 50, charset: "alphabetic" })
  while (cancelKey in callbackTable) cancelKey = randomstring.generate({ length: 50, charset: 'alphabetic' })
  reserveTable[cancelKey] = "registered"

  const returnPromise: Promise<T> = new Promise((resolve, reject) => {
    let canResolve = true
    let wasResolved = false
    let cancellationCallback: () => any

    const callbackFunc = () => {
      if (!wasResolved) {
        canResolve = false
        cancellationCallback()
      }
    }

    const setCancelCallback: CancelType = (callback) => {
      cancellationCallback = callback
    }

    callbackTable[cancelKey] = callbackFunc
    func(setCancelCallback).then((data) => {
      if (canResolve) {
        resolve(data)
        wasResolved = true
      }
    }).catch((error) => {
      if (canResolve) {
        reject(error)
        wasResolved = true
      }
    })
  })

  return [cancelKey, returnPromise]
}

const cancelPromise = (cancelKey: string) => {
  if (cancelKey in reserveTable && cancelKey in callbackTable) callbackTable[cancelKey]()
}

export { wrapPromise, cancelPromise }