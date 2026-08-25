import fs from "fs"
import path from "path"
import { BuildCtx } from "../../util/ctx"

/** Mirror @quartz-community/graph's Fu() slug normalization. */
function graphSlug(raw: string): string {
  let u = raw
  // ft(u, "index") — strip trailing "index" segment
  if (u === "index" || u.endsWith("/index")) {
    u = u === "index" ? "" : u.slice(0, -"index".length)
  }
  // _t(u, true) — strip leading slash only (keep trailing slash)
  if (u.startsWith("/")) u = u.slice(1)
  return u.length === 0 ? "/" : u
}

/**
 * Graph builds Map keys with Fu(jsonKey), but resolves the current page from the URL
 * via we() which strips trailing slashes — so Fu(study/index)=study/ never matches URL study.
 * Use URL-shaped keys (no trailing slash), except home which stays "/".
 */
export function indexKey(raw: string): string {
  const g = graphSlug(raw)
  if (g === "/") return "/"
  return g.endsWith("/") ? g.slice(0, -1) : g
}

type IndexEntry = {
  slug?: string
  links?: string[]
  [key: string]: unknown
}

/**
 * Rewrite contentIndex.json keys/links so local graph resolves folder pages.
 * Keeps entry.slug as the original full slug so Explorer's FileTrie stays correct.
 */
export async function rewriteContentIndexForGraph(ctx: BuildCtx): Promise<void> {
  const indexPath = path.join(ctx.argv.output, "static", "contentIndex.json")
  if (!fs.existsSync(indexPath)) return

  const raw = JSON.parse(await fs.promises.readFile(indexPath, "utf-8")) as Record<
    string,
    IndexEntry
  >

  const normalized: Record<string, IndexEntry> = {}

  for (const [key, entry] of Object.entries(raw)) {
    const primary = indexKey(key)
    const links = [...new Set((entry.links ?? []).map((l) => indexKey(l)))]

    const next: IndexEntry = {
      ...entry,
      // keep original slug for Explorer trie (study/index), only remap object keys
      links,
    }

    if (normalized[primary]) {
      const prev = normalized[primary]
      next.links = [...new Set([...(prev.links ?? []), ...links])]
      // Prefer keeping a real /index slug for Explorer when merging
      if (typeof prev.slug === "string" && prev.slug.endsWith("/index")) {
        next.slug = prev.slug
      }
    }
    normalized[primary] = next
  }

  for (const entry of Object.values(normalized)) {
    entry.links = [...new Set((entry.links ?? []).filter((l) => l in normalized))]
  }

  await fs.promises.writeFile(indexPath, JSON.stringify(normalized))
}
