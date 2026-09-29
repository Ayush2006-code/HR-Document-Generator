import PizZip from 'pizzip'

/** Bundles multiple generated file blobs into a single .zip Blob for
 * "Download All" (pizzip is already a dependency for docx templating, so
 * this avoids pulling in a second zip library just for this one feature). */
export async function zipFiles(files) {
  const zip = new PizZip()
  for (const file of files) {
    const buffer = await file.blob.arrayBuffer()
    zip.file(file.filename, buffer)
  }
  return zip.generate({ type: 'blob', mimeType: 'application/zip' })
}
