export default defineEventHandler(async (event) => {
  return proxyRequest(event, "https://adventofcode.com/2024/day/4/input", {
    fetchOptions: {
      signal: AbortSignal.timeout(10000),
    },
    headers: {
      Cookie: `session=${event.headers.get("Session")};`,
    },
  });
});
