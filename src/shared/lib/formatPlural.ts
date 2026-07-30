export function pluralize(count: number, one: string, few: string, many: string): string {
  const abs = Math.abs(count)
  const mod100 = abs % 100
  const mod10 = abs % 10

  if (mod100 >= 11 && mod100 <= 19) {
    return `${count} ${many}`
  }
  if (mod10 === 1) {
    return `${count} ${one}`
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return `${count} ${few}`
  }

  return `${count} ${many}`
}