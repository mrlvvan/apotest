"use client"

import { useEffect } from "react"

export default function GlobalClientScripts() {

  useEffect(() => {
    let cancelled = false
    let osInstance:
      | {
        destroy: () => void
        elements: () => { viewport: HTMLElement }
      }
      | undefined

    void import("overlayscrollbars").then(({ OverlayScrollbars }) => {
      if (cancelled) return
      const container = document.getElementById('main-container')!
      osInstance = OverlayScrollbars(container, {
        scrollbars: {
          autoHide: "move",
        },
      })
      osInstance.elements().viewport.scrollLeft = 0
    })

    return () => {
      cancelled = true
      osInstance?.destroy()
    }
  }, [])

  useEffect(() => {
    void document.fonts.ready.then(() => {
      document.body.classList.add("fonts-loaded")
    })
  }, [])

  return null
}
