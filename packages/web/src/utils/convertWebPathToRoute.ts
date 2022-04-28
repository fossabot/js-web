export const convertWebPathToRoute = (path: string) =>
  path
    .split('/')
    .map((segment) =>
      segment.startsWith(':') ? `[${segment.slice(1)}]` : segment,
    )
    .join('/');
