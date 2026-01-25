import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function formatTicketId(id: string) {
  if (!id) return "ID-..."
  if (id.includes('-') && id.length > 20) {
    // It's likely a UUID
    return `ID-${id.split('-')[0].toUpperCase()}`
  }
  return id.startsWith('ID-') ? id : `ID-${id.toUpperCase()}`
}
