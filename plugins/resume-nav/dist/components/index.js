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

/** GitHub + ORCID icon links — sidebar sibling of Notes (not inside explorer). */
export function SocialLinks() {
  const Component = ({ fileData, displayClass }) => {
    const base = pathToRoot(fileData.slug)
    const githubIcon = joinSegments(base, "static/github.svg")
    const orcidIcon = joinSegments(base, "static/orcid.png")

    return jsx("nav", {
      class: classNames(displayClass, "social-links"),
      "aria-label": "Profiles",
      children: [
        jsx("a", {
          href: "https://github.com/hyun-jin891",
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": "GitHub",
          title: "GitHub",
          children: jsx("img", {
            class: "social-links__icon social-links__icon--github",
            src: githubIcon,
            width: 22,
            height: 22,
            alt: "",
          }),
        }),
        jsx("a", {
          href: "https://orcid.org/0009-0006-3212-9038",
          target: "_blank",
          rel: "noopener noreferrer",
          "aria-label": "ORCID",
          title: "ORCID",
          children: jsx("img", {
            class: "social-links__icon social-links__icon--orcid",
            src: orcidIcon,
            width: 22,
            height: 22,
            alt: "",
          }),
        }),
      ],
    })
  }

  Component.css = `
.social-links {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.15rem 0 0.5rem;
  padding-top: 0.35rem;
}
.social-links a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  opacity: 0.85;
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.social-links a:hover {
  opacity: 1;
  transform: translateY(-1px);
}
.social-links__icon {
  display: block;
  width: 22px;
  height: 22px;
  object-fit: contain;
}
.social-links__icon--github {
  filter: none;
}
:root[saved-theme="dark"] .social-links__icon--github {
  filter: invert(1);
}
`
  return Component
}
