const leftPad = (n: number) => n.toString().padStart(2, '0')

/** Returns a calendar date `yyyy-mm-dd` */
export function getCalendarDate(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}-${leftPad(month)}-${leftPad(day)}`
}

export function fromCalendarDate(cal: string) {
  const [year, month, day] = cal.split('-').map(Number)
  return new Date(year, month - 1, day)
}

export function addDaysFromNow(days: number) {
  const now = new Date()
  const daysInMs = days * 24 * 60 * 60 * 1000
  return new Date(now.getTime() + daysInMs)
}
