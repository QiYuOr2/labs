function fetchSyncify(fn) {
  const originFetch = globalThis.fetch

  const cache = {
    status: 'pending',
    value: null
  }

  function newFetch(...args) {
    if (cache.status === 'fulfilled') {
      return cache.value
    }

    if (cache.status === 'rejected') {
      throw cache.value
    }

    const promise = originFetch(...args)
      .then(res => res.json())
      .then(data => {
        cache.status = 'fulfilled'
        cache.value = data
      })
      .catch(err => {
        cache.status = 'rejected'
        cache.value = err
      })

    throw promise
  }

  globalThis.fetch = newFetch

  try {
    fn()
  } catch (error) {
    if (error instanceof Promise) {
      error.finally(() => {
        globalThis.fetch = newFetch
        fn()
        globalThis.fetch = originFetch
      })
    }
  }

  globalThis.fetch = originFetch
}