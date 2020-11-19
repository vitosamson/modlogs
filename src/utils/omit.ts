export function omit<T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const nextObj = { ...obj };
  keys.forEach(key => {
    delete nextObj[key];
  });
  return nextObj;
}
