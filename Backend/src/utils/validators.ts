export function isValidHourFormat(value: string): boolean {
  const HH_MM_30_REGEX = /^([01]\d|2[0-3]):(00|30)$/;
  return HH_MM_30_REGEX.test(value);
}
