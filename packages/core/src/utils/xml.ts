import xml2js from 'xml2js';

export function parse(xml = '') {
  const parser = new xml2js.Parser();

  return parser.parseStringPromise(xml);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function build(options: xml2js.BuilderOptions, data: any) {
  const xmlBuilder = new xml2js.Builder(options);

  return xmlBuilder.buildObject(data);
}
