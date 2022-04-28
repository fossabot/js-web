import bytes from 'bytes';
import flow from 'lodash/flow';

type ConditionType = { [key: string]: any } | [string, any, any];

export function startsWith(text: string) {
  return (conditions: ConditionType[]) => {
    conditions.push(['starts-with', '$key', text]);
    return conditions;
  };
}

export function contentType(mime: string) {
  return (conditions: ConditionType[]) => {
    conditions.push({ 'Content-Type': mime });
    return conditions;
  };
}
export function maxSizeMB(mb: number) {
  return (conditions: ConditionType[]) => {
    conditions.push(['content-length-range', 0, bytes.parse(`${mb} MB`)]);
    return conditions;
  };
}

export function build(...ops: any[]) {
  return flow(ops)([]);
}
