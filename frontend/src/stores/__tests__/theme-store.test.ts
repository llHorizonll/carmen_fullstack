import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useThemeStore } from '../theme-store'

beforeEach(() => {
  // Reset to default
  useThemeStore.setState({ theme: 'system' })
  // Clean up DOM
  document.documentElement.classList.remove('light', 'dark')
})

describe('theme-store', () => {
  it('defaults to system theme', () => {
    expect(useThemeStore.getState().theme).toBe('system')
  })

  it('setTheme updates the theme', () => {
    useThemeStore.getState().setTheme('dark')
    expect(useThemeStore.getState().theme).toBe('dark')
  })

  it('setTheme to dark adds dark class', () => {
    useThemeStore.getState().setTheme('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.classList.contains('light')).toBe(false)
  })

  it('setTheme to light adds light class', () => {
    useThemeStore.getState().setTheme('light')
    expect(document.documentElement.classList.contains('light')).toBe(true)
    expect(document.documentElement.classList.contains('dark')).toBe(false)
  })

  it('setTheme to system uses matchMedia result', () => {
    // matchMedia is mocked to return { matches: false } so system => light
    useThemeStore.getState().setTheme('system')
    expect(document.documentElement.classList.contains('light')).toBe(true)
  })
})
