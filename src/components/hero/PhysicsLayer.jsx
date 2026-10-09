import { useEffect, useRef } from 'react'
import { getProducts } from '../../api/products'
import { useUi } from '../../store/ui'

/**
 * Canvas for the physics hero. Matter.js + the world module are downloaded only
 * when this mounts (after first paint / the intro). If anything fails, the static
 * hero stays as it is.
 */
export default function PhysicsLayer({ sectionRef, onReady }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    let world = null
    let cancelled = false
    Promise.all([import('../../physics/heroWorld'), getProducts({})])
      .then(async ([mod, products]) => {
        if (cancelled || !sectionRef.current || !canvasRef.current) return
        const created = await mod.createHeroWorld({
          section: sectionRef.current,
          canvas: canvasRef.current,
          products,
          onQuickView: (id) => useUi.getState().openQuickView(id),
        })
        if (cancelled) {
          created.destroy()
          return
        }
        world = created
        onReady?.(created)
      })
      .catch((err) => {
        if (import.meta.env.DEV) console.warn('physics hero disabled:', err)
      })
    return () => {
      cancelled = true
      world?.destroy()
      onReady?.(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 h-full w-full" />
}
