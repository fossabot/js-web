export function encodeJson(obj: Record<string, any>) {
  return Buffer.from(JSON.stringify(obj), 'binary').toString('base64');
}

export function decodeJson(encoded: string) {
  return JSON.parse(Buffer.from(encoded, 'base64').toString());
}
