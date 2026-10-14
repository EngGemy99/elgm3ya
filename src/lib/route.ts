export type Route =
  | { name: "home" }
  | { name: "new" }
  | { name: "detail"; id: string };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, "") || "/";
  if (path === "/new") return { name: "new" };
  const match = /^\/a\/([^/]+)$/.exec(path);
  if (match) return { name: "detail", id: decodeURIComponent(match[1]) };
  return { name: "home" };
}

export function navigate(path: string): void {
  const next = path.startsWith("#") ? path : `#${path}`;
  if (window.location.hash === next) return;
  window.location.hash = next;
}
