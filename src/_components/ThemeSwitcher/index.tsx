'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Tooltip } from 'react-tooltip'

export function ThemeSwitcher() {
  const [mounted, setMounted] = React.useState(false)
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <button
        className="
          inline-flex items-center justify-center
          p-2 rounded-lg
          text-[var(--text-primary)]
          bg-[var(--bg-primary)]
          border dark:border-[var(--bg-secondary)]
        "
        aria-label="Theme switcher"
      >
        <Sun className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          inline-flex items-center justify-center
          p-2 rounded-lg
          text-[var(--text-primary)]
          bg-[var(--bg-primary)]
          border border-gray-200 dark:border-[var(--bg-secondary)]
          hover:bg-gray-50 dark:hover:bg-[var(--bg-secondary)]
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          focus:ring-gray-500 dark:focus:ring-[var(--text-secondary)]
        "
        aria-label="Wybierz tryb graficzny"
        aria-expanded={isOpen}
        data-tooltip-id="theme-switcher-tooltip"
        data-tooltip-content="Wybierz tryb graficzny"
      >
        <Sun className={`h-5 w-5 transition-all ${resolvedTheme === 'dark' ? 'scale-0 -rotate-90' : 'scale-100 rotate-0'}`} />
        <Moon className={`absolute h-5 w-5 transition-all ${resolvedTheme === 'dark' ? 'scale-100 rotate-0' : 'scale-0 rotate-90'}`} />
        <span className="sr-only">Toggle theme</span>
      </button>
      
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 bottom-full mb-2 w-36 rounded-md shadow-lg bg-[var(--bg-primary)] border border-gray-200 dark:border-[var(--bg-secondary)] z-50">
            <div className="py-1" role="menu">
              <button
                onClick={() => {
                  setTheme('light')
                  setIsOpen(false)
                }}
                className="
                  w-full text-left px-4 py-2 text-sm
                  text-[var(--text-primary)]
                  hover:bg-gray-100 dark:hover:bg-[var(--bg-secondary)]
                  flex items-center gap-2
                  transition-colors
                "
                role="menuitem"
              >
                <Sun className="h-4 w-4" />
                Jasny
              </button>
              <button
                onClick={() => {
                  setTheme('dark')
                  setIsOpen(false)
                }}
                className="
                  w-full text-left px-4 py-2 text-sm
                  text-[var(--text-primary)]
                  hover:bg-gray-100 dark:hover:bg-[var(--bg-secondary)]
                  flex items-center gap-2
                  transition-colors
                "
                role="menuitem"
              >
                <Moon className="h-4 w-4" />
                Ciemny
              </button>
              <button
                onClick={() => {
                  setTheme('system')
                  setIsOpen(false)
                }}
                className="
                  w-full text-left px-4 py-2 text-sm
                  text-[var(--text-primary)]
                  hover:bg-gray-100 dark:hover:bg-[var(--bg-secondary)]
                  flex items-center gap-2
                  transition-colors
                "
                role="menuitem"
              >
                <Monitor className="h-4 w-4" />
                Systemowy
              </button>
            </div>
          </div>
        </>
      )}
      <Tooltip 
        id="theme-switcher-tooltip"
        place="top"
      />
    </div>
  )
}
