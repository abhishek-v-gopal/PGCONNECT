export type RentStatus = 'paid' | 'due' | 'overdue' | null

// Rent months are always stored as the first of the month (payments.month).
export const currentMonthKey = (today: Date = new Date()): string =>
  `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-01`

// Rent for a given calendar month is due on the anniversary of the tenant's
// move-in day, and overdue once that day passes unpaid.
export const computeRentStatus = (
  bookingStatus: string,
  moveInDate: string,
  paidThisMonth: boolean,
  today: Date = new Date()
): RentStatus => {
  if (!['confirmed', 'active'].includes(bookingStatus)) return null
  if (paidThisMonth) return 'paid'

  const dueDay = new Date(`${moveInDate}T00:00:00`).getDate()
  const todayDay = today.getDate()
  return todayDay > dueDay ? 'overdue' : 'due'
}
