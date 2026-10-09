import { useEffect } from 'react'
import { lockScroll, unlockScroll } from '../lib/scrollLock'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea, [tabindex]:not([tabindex="-1"])'

/**
 * Modal dialog behaviour: locks page scroll, focuses `initialFocusRef` (or the panel),
 * traps Tab inside `panelRef`, closes on Escape and restores focus on close.
 */
export function useDialog(open, { onClose, panelRef, initialFocusRef }) {
  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement
    lockScroll()
    ;(initialFocusRef?.current || panelRef.current)?.focus({ preventScroll: true })

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
        return
      }
      if (e.key !== 'Tab' || !panelRef.current) return
      const nodes = panelRef.current.querySelectorAll(FOCUSABLE)
      if (!nodes.length) return
      const first = nodes[0]
      const last = nodes[nodes.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      unlockScroll()
      document.removeEventListener('keydown', onKey)
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true })
    }
  }, [open, onClose, panelRef, initialFocusRef])
}
