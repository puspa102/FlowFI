export function toSignedAmount(amount: number, type: string) {
  return type === 'EXPENSE' ? -Math.abs(amount) : Math.abs(amount)
}

export function toCurrencyNumber(amount: number) {
  return Number(amount.toFixed(2))
}

export function getMonthLabel(date: Date) {
  return date.toLocaleString('en-US', { month: 'short' })
}

export function buildMonthStart(date: Date) {
  const monthStart = new Date(date)
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)
  return monthStart
}

export function shiftMonths(date: Date, amount: number) {
  const shifted = new Date(date)
  shifted.setMonth(shifted.getMonth() + amount)
  return shifted
}
