import { describe, expect, it } from 'vitest'
import { formatCurrency, formatDate, formatDateTime, getInitials } from './format'

describe('formatDate', () => {
  it('formats a date-only ISO string', () => {
    expect(formatDate('2024-06-01')).toBe('01 Jun 2024')
  })

  it('returns a dash for missing or invalid values', () => {
    expect(formatDate(null)).toBe('-')
    expect(formatDate(undefined)).toBe('-')
    expect(formatDate('not-a-date')).toBe('-')
  })
})

describe('formatDateTime', () => {
  it('includes the date and time components', () => {
    const result = formatDateTime('2024-06-01T10:30:00')
    expect(result).toContain('2024')
    expect(result).not.toBe('-')
  })

  it('returns a dash for empty input', () => {
    expect(formatDateTime('')).toBe('-')
  })
})

describe('formatCurrency', () => {
  it('formats a value using Indian grouping', () => {
    expect(formatCurrency(650000)).toContain('6,50,000')
  })

  it('returns a dash for missing values', () => {
    expect(formatCurrency(null)).toBe('-')
    expect(formatCurrency(undefined)).toBe('-')
    expect(formatCurrency(Number.NaN)).toBe('-')
  })
})

describe('getInitials', () => {
  it('takes up to two initials', () => {
    expect(getInitials('Aarav Sharma')).toBe('AS')
    expect(getInitials('john ronald reuel')).toBe('JR')
  })

  it('handles a single name', () => {
    expect(getInitials('Aarav')).toBe('A')
  })

  it('returns an empty string for blank input', () => {
    expect(getInitials('   ')).toBe('')
  })
})
