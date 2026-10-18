export type HealthIndicator = 'green' | 'amber' | 'red' | string

export interface HealthStatus {
  label: string
  /** Tailwind text-colour class for inline use (e.g. result pages) */
  colorClass: string
  /** Tailwind bg + text badge classes for table chips (e.g. history list) */
  badgeClass: string
}

/**
 * Shared formatting helpers used across quote components.
 * Plain functions — no reactive state — so they can be imported directly
 * or destructured from the composable call.
 */
export function useFormatters() {
  /**
   * Format a numeric currency value.
   * Uses the browser locale for thousand separators; always 2 decimal places.
   * Prefix is optional (defaults to '$' when no symbol is known).
   */
  function formatCurrency(value: number | string, symbol = '$'): string {
    const num = typeof value === 'string' ? parseFloat(value) : value
    if (isNaN(num)) return `${symbol}0.00`
    return `${symbol}${num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  /**
   * Format a number without a currency prefix (e.g. for margin %).
   * Matches the original `formatNumber` in ProfitForm.
   */
  function formatNumber(value: number): string {
    if (typeof value !== 'number' || isNaN(value)) return '0.00'
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  /**
   * Short date — "Jan 5, 2025" — used in list/table views.
   */
  function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  /**
   * Long date + time — "1/5/2025, 3:45:00 PM" — used in detail views.
   */
  function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleString()
  }

  /**
   * Resolve a health indicator string to a human label, a Tailwind text-colour
   * class, and a Tailwind badge (bg + text) class.
   */
  function resolveHealth(indicator: HealthIndicator | undefined | null): HealthStatus {
    switch (indicator) {
      case 'green':
        return { label: 'Good', colorClass: 'text-green-600', badgeClass: 'bg-green-100 text-green-700' }
      case 'amber':
        return { label: 'Needs Review', colorClass: 'text-yellow-600', badgeClass: 'bg-yellow-100 text-yellow-700' }
      case 'red':
        return { label: 'Poor', colorClass: 'text-red-600', badgeClass: 'bg-red-100 text-red-700' }
      default:
        return {
          label: indicator ?? 'N/A',
          colorClass: '',
          badgeClass: 'bg-gray-100 text-gray-700',
        }
    }
  }

  return { formatCurrency, formatNumber, formatDate, formatDateTime, resolveHealth }
}
