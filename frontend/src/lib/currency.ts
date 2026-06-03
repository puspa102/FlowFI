import { useGetProfileQuery } from '@/store/api/profileApi'

const LOCALE_MAP: Record<string, string> = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  NPR: 'ne-NP',
  INR: 'en-IN',
  AUD: 'en-AU',
  CAD: 'en-CA',
  JPY: 'ja-JP',
  CNY: 'zh-CN',
}

function getLocale(currency: string): string {
  return LOCALE_MAP[currency] ?? 'en-US'
}

export function formatMoney(value: number, currency = 'USD', fractionDigits?: number): string {
  const locale = getLocale(currency)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits ?? 0,
    maximumFractionDigits: fractionDigits ?? 2,
  }).format(value)
}

export function useUserCurrency(): string {
  const { data: profile } = useGetProfileQuery(undefined)
  return profile?.currency ?? 'USD'
}
