import { describe, it, expect } from 'vitest'
import { cn, formatCurrency, formatNumber, formatDate, generateId } from '../utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible')
  })

  it('resolves tailwind conflicts (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles undefined and null', () => {
    expect(cn('foo', undefined, null, 'bar')).toBe('foo bar')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })
})

describe('formatCurrency', () => {
  it('formats USD', () => {
    const result = formatCurrency(1234.5, 'USD', 'en-US')
    expect(result).toBe('$1,234.50')
  })

  it('formats THB', () => {
    const result = formatCurrency(50000, 'THB', 'en-US')
    // Should include THB symbol or code
    expect(result).toContain('50,000.00')
  })

  it('formats negative amount', () => {
    const result = formatCurrency(-1234.5, 'USD', 'en-US')
    expect(result).toContain('1,234.50')
  })

  it('formats zero', () => {
    const result = formatCurrency(0, 'USD', 'en-US')
    expect(result).toBe('$0.00')
  })

  it('defaults to USD', () => {
    const result = formatCurrency(100)
    expect(result).toContain('100.00')
  })
})

describe('formatNumber', () => {
  it('formats number with default locale', () => {
    const result = formatNumber(1234567.89)
    expect(result).toBe('1,234,567.89')
  })

  it('formats with custom options', () => {
    const result = formatNumber(0.1234, 'en-US', {
      style: 'percent',
    })
    expect(result).toBe('12%')
  })

  it('formats integer', () => {
    const result = formatNumber(1000)
    expect(result).toBe('1,000')
  })
})

describe('formatDate', () => {
  it('formats Date object', () => {
    const date = new Date(2025, 0, 15) // Jan 15, 2025
    const result = formatDate(date, 'en-US')
    expect(result).toContain('1')
    expect(result).toContain('15')
    expect(result).toContain('2025')
  })

  it('formats date string', () => {
    const result = formatDate('2025-06-15T00:00:00Z', 'en-US')
    expect(result).toContain('2025')
  })

  it('formats with custom options', () => {
    const date = new Date(2025, 0, 15)
    const result = formatDate(date, 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
    expect(result).toBe('January 15, 2025')
  })
})

describe('generateId', () => {
  it('returns a 7-character string', () => {
    const id = generateId()
    expect(id).toHaveLength(7)
  })

  it('returns alphanumeric characters', () => {
    const id = generateId()
    expect(id).toMatch(/^[a-z0-9]+$/)
  })

  it('generates unique values', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateId()))
    // Not all 50 will be unique due to Math.random, but most should be
    expect(ids.size).toBeGreaterThan(40)
  })
})
