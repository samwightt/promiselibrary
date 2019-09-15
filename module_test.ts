import randomstring from 'randomstring'

type SetCancelCallbackType = (callback: () => any) => void

let reserveTable: { [key: string]: boolean } = {}
let callbackTable: { [key: string]: () => void } = {}

const wrapPromise = <T>(inputFunction: (call: SetCancelCallbackType) => Promise<T>): [string, Promise<T>] => {
  let cancelKey: string = ""
  while (!cancelKey && cancelKey in reserveTable) cancelKey = randomstring.generate({ length: 50, charset: "alphabetic" })
  reserveTable[cancelKey] = true

  const returnPromise: Promise<T> = new Promise((resolve, reject) => {
    let canResolve = true
    let wasResolved = false
    let cancellationCallback: () => any

    const callbackFunction = () => {
      if (!wasResolved) {
        canResolve = false
        cancellationCallback()
      }
    }
    callbackTable[cancelKey] = callbackFunction

    const setCancelCallback: SetCancelCallbackType = (callback) => cancellationCallback = callback

    inputFunction(setCancelCallback)
      .then(data => {
        if (canResolve) {
          resolve(data)
          wasResolved = true
        }
      })
      .catch(error => {
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