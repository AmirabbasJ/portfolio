export function normalizePath(path: string) {
  const parts = path.split('/');
  const result = [];

  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') {
      result.pop();
    } else {
      result.push(part);
    }
  }

  return (path.startsWith('/') ? '/' : '') + result.join('/');
}
