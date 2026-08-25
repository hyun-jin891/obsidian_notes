import { FullSlug } from "../../util/path"
import { ProcessedContent } from "../vfile"

function folderPrefix(slug: string): string | null {
  if (slug === "index") return ""
  if (slug.endsWith("/index")) return slug.slice(0, -"index".length)
  return null
}

function isDirectChild(parentPrefix: string, childSlug: string): boolean {
  if (childSlug === parentPrefix + "index") return false
  if (parentPrefix === "") {
    // root-level "folder" is site home — skip synthetic root linking
    return false
  }
  if (!childSlug.startsWith(parentPrefix)) return false
  const rel = childSlug.slice(parentPrefix.length)
  if (!rel || rel === "index") return false
  const parts = rel.split("/")
  // study/omics/bulk-rna-seq
  if (parts.length === 1) return true
  // study/biology/genetics/index
  if (parts.length === 2 && parts[1] === "index") return true
  return false
}

/**
 * For each folder/index (sub-root) page, ensure links include all direct child notes
 * so the local graph can show level+1 neighbors.
 */
export function injectFolderGraphLinks(content: ProcessedContent[]): void {
  const slugs = content
    .map(([_, file]) => file.data.slug)
    .filter((s): s is FullSlug => typeof s === "string")

  for (const [_, file] of content) {
    const slug = file.data.slug
    if (!slug) continue

    const prefix = folderPrefix(slug)
    if (prefix === null) continue

    const childLinks = slugs.filter((child) => isDirectChild(prefix, child))
    if (childLinks.length === 0) continue

    const existing = (file.data.links as string[] | undefined) ?? []
    file.data.links = [...new Set([...existing, ...childLinks])] as FullSlug[]
  }
}
