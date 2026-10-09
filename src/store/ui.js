import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { prefersReducedMotion } from '../hooks/useReducedMotion'

const INTRO_KEY = 'socksavvy-intro'

function introAlreadyPlayed() {
  try {
    return sessionStorage.getItem(INTRO_KEY) === '1'
  } catch {
    return true // storage blocked → never trap the visitor in an intro
  }
}

export function markIntroPlayed() {
  try {
    sessionStorage.setItem(INTRO_KEY, '1')
  } catch {
    /* ignore */
  }
}

/**
 * UI / delight state. Only `soundOn` persists (localStorage "socksavvy-ui").
 *   introDone   — false while the first-visit intro is on screen
 *   quickViewId — product id shown in the quick-view dialog (null = closed)
 */
export const useUi = create(
  persist(
    (set) => ({
      soundOn: false,
      introDone: typeof window === 'undefined' || introAlreadyPlayed() || prefersReducedMotion(),
      quickViewId: null,

      finishIntro: () => {
        markIntroPlayed()
        set({ introDone: true })
      },
      setSound: (soundOn) => set({ soundOn }),
      openQuickView: (quickViewId) => set({ quickViewId }),
      closeQuickView: () => set({ quickViewId: null }),
    }),
    {
      name: 'socksavvy-ui',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ soundOn: state.soundOn }),
    },
  ),
)
