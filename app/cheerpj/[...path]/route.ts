// Same-origin proxy for the CheerpJ runtime used by public/freej2me. CheerpJ's helper frame
// has no COEP header, so it is blocked under our cross-origin isolation unless served from here.
const UPSTREAM = "https://cjrtnc.leaningtech.com/20260317_2978/";
const FORWARDED_REQUEST_HEADERS = ["range", "if-none-match", "if-modified-since"];
// fetch() transparently decodes bodies, so length/encoding headers are intentionally not forwarded.
const FORWARDED_RESPONSE_HEADERS = [
  "content-type",
  "content-range",
  "accept-ranges",
  "etag",
  "last-modified",
  "cache-control",
];

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  if (path.some((segment) => segment === ".." || segment === ".")) {
    return new Response("bad path", { status: 400 });
  }

  const url = new URL(UPSTREAM + path.map(encodeURIComponent).join("/"));
  url.search = new URL(request.url).search;

  const headers = new Headers({ "accept-encoding": "identity" });
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = request.headers.get(name);
    if (value) {
      headers.set(name, value);
    }
  }

  const upstream = await fetch(url, { headers });
  const responseHeaders = new Headers();
  for (const name of FORWARDED_RESPONSE_HEADERS) {
    const value = upstream.headers.get(name);
    if (value) {
      responseHeaders.set(name, value);
    }
  }
  responseHeaders.set("Cross-Origin-Embedder-Policy", "require-corp");
  responseHeaders.set("Cross-Origin-Resource-Policy", "same-origin");

  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}
