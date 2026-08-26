import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { componentRegistry } from "./quartz/components/registry"
import { PageTypeDispatcher } from "./quartz/plugins/pageTypes/dispatcher"
import { injectFolderGraphLinks } from "./quartz/plugins/emitters/folderGraphLinks"
import { rewriteContentIndexForGraph } from "./quartz/plugins/emitters/normalizeGraphIndex"
import { ResumeNav, SocialLinks } from "./plugins/resume-nav/dist/components/index.js"
import { QuartzComponent } from "./quartz/components/types"
import { BuildCtx } from "./quartz/util/ctx"
import { ProcessedContent } from "./quartz/plugins/vfile"
import { StaticResources } from "./quartz/util/resources"
import { ChangeEvent } from "./quartz/plugins/types"

const resumeFilterFn = (node: {
  slugSegment?: string
  data?: { slug?: string } | null
}) => {
  const segment = node.slugSegment ?? ""
  const slug = node.data?.slug ?? ""
  if (segment === "tags") return false
  if (segment === "resume" || slug === "resume") return false
  return true
}

/** Home Browse order: Study → Research → Project, then A–Z for the rest.
 * Keep this flat (no nested functions) — explorer serializes via `.toString()`
 * and esbuild `__name(...)` wrappers break `new Function` in the browser.
 */
const explorerSortFn = (
  a: { isFolder?: boolean; displayName?: string; slugSegment?: string },
  b: { isFolder?: boolean; displayName?: string; slugSegment?: string },
) => {
  const nameA = (a.displayName || a.slugSegment || "").toLowerCase()
  const nameB = (b.displayName || b.slugSegment || "").toLowerCase()
  const rankA =
    nameA === "study" ? 0 : nameA === "research" ? 1 : nameA === "project" ? 2 : 100
  const rankB =
    nameB === "study" ? 0 : nameB === "research" ? 1 : nameB === "project" ? 2 : 100

  if ((!a.isFolder && !b.isFolder) || (a.isFolder && b.isFolder)) {
    if (rankA !== rankB) return rankA - rankB
    return (a.displayName || "").localeCompare(b.displayName || "", undefined, {
      numeric: true,
      sensitivity: "base",
    })
  }
  if (!a.isFolder && b.isFolder) return 1
  return -1
}

for (const key of ["explorer", "@quartz-community/explorer"]) {
  componentRegistry.setOptionOverrides(key, {
    filterFn: resumeFilterFn,
    sortFn: explorerSortFn,
  })
}

const config = await loadQuartzConfig()

const baseLayout = await loadQuartzLayout()
const resumeNav = ResumeNav() as QuartzComponent
const socialLinks = SocialLinks() as QuartzComponent

function injectSidebarExtras(left: QuartzComponent[] | undefined): QuartzComponent[] {
  if (!left || left.length === 0) return [resumeNav, socialLinks]
  const copy = [...left]
  // Resume just above Notes/explorer; social icons after Notes (sibling, not nested)
  copy.splice(Math.max(copy.length - 1, 0), 0, resumeNav)
  copy.push(socialLinks)
  return copy
}

const layoutWithResume = {
  defaults: {
    ...baseLayout.defaults,
    left: injectSidebarExtras(baseLayout.defaults.left as QuartzComponent[] | undefined),
  },
  byPageType: Object.fromEntries(
    Object.entries(baseLayout.byPageType).map(([pageType, pageLayout]) => [
      pageType,
      {
        ...pageLayout,
        left: injectSidebarExtras(
          (pageLayout.left as QuartzComponent[] | undefined) ??
            (baseLayout.defaults.left as QuartzComponent[] | undefined),
        ),
      },
    ]),
  ),
}

// ContentIndex runs in parallel with other emitters — wrap it so folder child links
// and URL-shaped graph keys are applied atomically around its write.
const contentIndex = config.plugins.emitters.find((e) => e.name === "ContentIndex")
if (contentIndex) {
  const originalEmit = contentIndex.emit.bind(contentIndex)
  contentIndex.emit = async (
    ctx: BuildCtx,
    content: ProcessedContent[],
    resources: StaticResources,
  ) => {
    injectFolderGraphLinks(content)
    const result = await originalEmit(ctx, content, resources)
    await rewriteContentIndexForGraph(ctx)
    return result
  }

  if (contentIndex.partialEmit) {
    const originalPartial = contentIndex.partialEmit.bind(contentIndex)
    contentIndex.partialEmit = async (
      ctx: BuildCtx,
      content: ProcessedContent[],
      resources: StaticResources,
      changeEvents: ChangeEvent[],
    ) => {
      injectFolderGraphLinks(content)
      const result = await originalPartial(ctx, content, resources, changeEvents)
      if (result !== null) await rewriteContentIndexForGraph(ctx)
      return result
    }
  }
}

config.plugins.emitters = [
  ...config.plugins.emitters.filter((emitter) => emitter.name !== "PageTypeDispatcher"),
  PageTypeDispatcher({
    defaults: layoutWithResume.defaults,
    byPageType: layoutWithResume.byPageType,
  }),
]

export default config
export const layout = layoutWithResume
