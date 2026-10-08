import { useEffect, useState } from 'react'

/**
 * Run an async loader whenever `deps` change. Keeps the previous data while
 * reloading (no flash when filters change) and aborts stale requests.
 *   const { data, loading, error } = useAsync(({ signal }) => getProducts(filters, { signal }), [key])
 */
export function useAsync(loader, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: null })

  useEffect(() => {
    const controller = new AbortController()
    let alive = true
    setState((s) => ({ ...s, loading: true, error: null }))
    loader({ signal: controller.signal })
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => {
        if (alive && error?.name !== 'AbortError') setState({ data: null, loading: false, error })
      })
    return () => {
      alive = false
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}
