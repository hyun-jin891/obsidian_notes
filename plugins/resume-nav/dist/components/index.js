import { jsx } from "preact/jsx-runtime"

function joinSegments(...args) {
  return args
    .filter((segment) => segment !== "" && segment !== "/")
    .map((segment) => String(segment).replace(/^\/+|\/+$/g, ""))
    .filter(Boolean)
    .join("/")
}

function pathToRoot(slug) {
  let rootPath = slug
    .split("/")
    .filter((x) => x !== "")
    .slice(0, -1)
    .map(() => "..")
    .join("/")
  if (rootPath.length === 0) rootPath = "."
  return rootPath
}

function simplifySlug(fp) {
  const res = fp.replace(/\/index$/, "").replace(/^\/+|\/+$/g, "")
  return res.length === 0 ? "/" : res
}

function resolveRelative(current, target) {
  return joinSegments(pathToRoot(current), simplifySlug(target))
}

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

export function ResumeNav() {
  const Component = ({ fileData, displayClass }) => {
    const href = resolveRelative(fileData.slug, "resume")
    const active = fileData.slug === "resume"

    return jsx("h2", {
      class: classNames(displayClass, "resume-nav", active && "active"),
      children: jsx("a", {
        href,
        "data-slug": "resume",
        children: "Resume",
      }),
    })
  }


  Component.css = `
.resume-nav {
  margin: 1rem 0 0.35rem;
  font-size: 1.1rem;
  font-family: var(--headerFont);
  font-weight: 600;
  letter-spacing: -0.015em;
}
.resume-nav a {
  color: var(--dark);
  text-decoration: none;
  transition: color 0.15s ease;
}
.resume-nav a:hover,
.resume-nav.active a {
  color: var(--secondary);
}
`
  return Component
}
