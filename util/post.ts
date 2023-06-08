export function formatDate (date: Date) {
  const d = new Date(date)
  // format 6/3/23 1:29 PM
  return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear().toString().slice(2)} ${d.getHours() % 12}:${d.getMinutes()} ${d.getHours() > 12 ? 'PM' : 'AM'}`
}
