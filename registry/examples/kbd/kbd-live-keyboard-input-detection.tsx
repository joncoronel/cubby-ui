"use client"

import { Kbd } from "@/registry/default/kbd/kbd"
import { useState, useEffect } from "react"

export default function KbdLiveKeyboardInputDetection() {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase()
      setPressedKeys(prev => new Set(prev).add(key))
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toUpperCase()
      setPressedKeys(prev => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  return (
    <div className="space-y-4">
      <p className="text-sm">Try typing on your keyboard to see the pressed state:</p>
      <div className="flex gap-2 flex-wrap">
        {["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"].map((key) => (
          <Kbd key={key} pressed={pressedKeys.has(key)}>
            {key}
          </Kbd>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {["A", "S", "D", "F", "G", "H", "J", "K", "L"].map((key) => (
          <Kbd key={key} pressed={pressedKeys.has(key)}>
            {key}
          </Kbd>
        ))}
      </div>
      <div className="flex gap-2 flex-wrap">
        {["Z", "X", "C", "V", "B", "N", "M"].map((key) => (
          <Kbd key={key} pressed={pressedKeys.has(key)}>
            {key}
          </Kbd>
        ))}
      </div>
      <div className="flex gap-2">
        <Kbd pressed={pressedKeys.has(" ")} size="lg">Space</Kbd>
        <Kbd pressed={pressedKeys.has("SHIFT")}>Shift</Kbd>
        <Kbd pressed={pressedKeys.has("CONTROL")}>Ctrl</Kbd>
        <Kbd pressed={pressedKeys.has("META")}>⌘</Kbd>
      </div>
      {pressedKeys.size > 0 && (
        <p className="text-sm text-muted-foreground">
          Currently pressed: {Array.from(pressedKeys).join(", ")}
        </p>
      )}
    </div>
  )
}