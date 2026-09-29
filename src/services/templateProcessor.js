// Thin wrapper around docxtemplater + pizzip: loads a .docx template (an
// ArrayBuffer) and a flat { TAG_NAME: value } map, and returns a filled
// .docx Blob. This is the ONLY place that talks to docxtemplater, so the
// rest of the app never touches the template internals.
//
// Why this is safe for our templates specifically: every {{TAG}} in
// templates/*.docx was placed by scripts/build_templates.py so that the
// ENTIRE tag lives inside a single Word run (see that script's header
// comment) — there are no tags split across runs, which is the usual
// failure mode when hand-editing a .docx tag. docxtemplater will therefore
// find every tag on its first parse without needing extra "raw XML" tricks.

import PizZip from 'pizzip'
import Docxtemplater from 'docxtemplater'
import { getTemplateOverride } from './templateStorage.js'
import { AppError } from '../utils/errors.js'

// FIX #16 — placeholder-leak guard. Any file inside the generated .docx
// that could contain visible text is scanned for a leftover {{TAG}} before
// the document is ever returned to a caller (and therefore before it can
// be previewed or downloaded). A leak here means either a value was never
// supplied for a tag the template expects, or an uploaded replacement
// template used a tag name the app doesn't know about — both are treated
// as a hard stop, never a partially-broken download.
const XML_PARTS_TO_SCAN = /^word\/(document|header\d*|footer\d*|footnotes|endnotes)\.xml$/
const PLACEHOLDER_PATTERN = /\{\{\s*[A-Za-z0-9_]+\s*\}\}/g

function scanForLeakedPlaceholders(zip) {
  const leaked = new Set()
  Object.keys(zip.files).forEach((path) => {
    if (!XML_PARTS_TO_SCAN.test(path)) return
    const content = zip.files[path].asText()
    const matches = content.match(PLACEHOLDER_PATTERN)
    if (matches) matches.forEach((m) => leaked.add(m))
  })
  return Array.from(leaked)
}

const templateCache = new Map()

/** Maps a public template URL to the key used for HR-uploaded overrides. */
export function templateKeyFromUrl(url) {
  return url.split('/').pop()
}

async function fetchTemplateArrayBuffer(url) {
  const key = templateKeyFromUrl(url)
  const override = await getTemplateOverride(key)
  if (override) return override

  if (templateCache.has(url)) return templateCache.get(url)
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Could not load template at ${url} (HTTP ${response.status}).`)
  }
  const buffer = await response.arrayBuffer()
  templateCache.set(url, buffer)
  return buffer
}

/**
 * @param {string} templateUrl - path under /public, e.g. "/templates/offer-letter-template.docx"
 * @param {Record<string, string>} data - flat tag map, e.g. { EMPLOYEE_NAME: "Rahul Sharma" }
 * @returns {Promise<Blob>}
 */
export async function fillDocxTemplate(templateUrl, data) {
  const arrayBuffer = await fetchTemplateArrayBuffer(templateUrl)
  const zip = new PizZip(arrayBuffer.slice(0)) // slice(0) clones so the cached buffer is never mutated
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start: '{{', end: '}}' },
  })

  try {
    doc.render(data)
  } catch (error) {
    const details = error.properties?.errors
      ?.map((e) => e.properties?.explanation)
      .filter(Boolean)
      .join('; ')
    throw new AppError(`Could not fill the document template.${details ? ` ${details}` : ''}`)
  }

  const outputZip = doc.getZip()
  const leaked = scanForLeakedPlaceholders(outputZip)
  if (leaked.length > 0) {
    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.warn('Blocked a document with unresolved placeholders:', leaked)
    }
    throw new AppError(
      `Some document fields are not populated. Please review the highlighted fields. (Unresolved: ${leaked.join(', ')})`
    )
  }

  return outputZip.generate({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}

/** Clears the in-memory template cache — useful after replacing a template file. */
export function clearTemplateCache() {
  templateCache.clear()
}

/**
 * FIX #20 — before accepting an HR-uploaded replacement template, checks
 * that every tag the app needs to fill is actually present in the file
 * (scanning the same document/header/footer XML parts the leak-guard
 * above checks). Returns the list of required tags that are MISSING —
 * an empty array means the template is safe to accept.
 */
export function findMissingTags(arrayBuffer, requiredTags) {
  let zip
  try {
    zip = new PizZip(arrayBuffer)
  } catch {
    // Not a valid zip/.docx at all.
    return requiredTags
  }
  let combinedText = ''
  Object.keys(zip.files).forEach((path) => {
    if (!XML_PARTS_TO_SCAN.test(path)) return
    combinedText += zip.files[path].asText()
  })
  return requiredTags.filter((tag) => !combinedText.includes(`{{${tag}}}`))
}
