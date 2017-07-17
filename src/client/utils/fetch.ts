export default function fetch(input: RequestInfo, init?: RequestInit) {
  return window.fetch(input, Object.assign({}, { credentials: 'include' }, init)).then(res => {
    if (!res.ok) throw res;
    return res;
  });
}
