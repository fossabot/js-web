export function getEnumKeyByEnumValue(
  myEnum: any,
  enumValue: number | string,
): string {
  const keys = Object.keys(myEnum).filter((x) => myEnum[x] === enumValue);
  return keys.length > 0 ? keys[0] : '';
}
