import { supabase } from './supabaseClient.js'

const STORAGE_BUCKET = 'documents'

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  if (!user) {
    throw new Error('You must be signed in to manage document history.')
  }

  return user
}

function fromDatabaseDocument(row) {
  if (!row) return null

  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    documentType: row.document_type,
    version: row.version,
    generatedAt: row.generated_at,
    files: Array.isArray(row.files) ? row.files : [],
    createdAt: row.created_at,
  }
}

/**
 * Returns all generated document history for the current user.
 */
export async function listHistory() {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .order('generated_at', {
      ascending: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map(fromDatabaseDocument)
}

/**
 * Returns document history for a specific employee.
 */
export async function listHistoryForEmployee(employeeId) {
  if (!employeeId) return []

  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
    .eq('employee_id', employeeId)
    .order('generated_at', {
      ascending: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map(fromDatabaseDocument)
}

/**
 * Records generated DOCX files.
 *
 * files:
 * [
 *   {
 *     kind: 'docx',
 *     blob: Blob,
 *     filename: 'Offer-Letter.docx'
 *   }
 * ]
 */
export async function recordDocument({
  employeeId,
  employeeName,
  documentType,
  files,
}) {
  if (!employeeId) {
    throw new Error('Employee ID is required.')
  }

  if (!employeeName) {
    throw new Error('Employee name is required.')
  }

  if (!documentType) {
    throw new Error('Document type is required.')
  }

  if (!Array.isArray(files) || files.length === 0) {
    throw new Error('At least one generated file is required.')
  }

  const user = await getCurrentUser()

  /*
   * Find the current number of versions for this employee
   * and document type.
   */
  const { data: existingDocuments, error: versionError } =
    await supabase
      .from('documents')
      .select('version')
      .eq('user_id', user.id)
      .eq('employee_id', employeeId)
      .eq('document_type', documentType)
      .order('version', {
        ascending: false,
      })
      .limit(1)

  if (versionError) {
    throw new Error(versionError.message)
  }

  const latestVersion =
    existingDocuments && existingDocuments.length > 0
      ? Number(existingDocuments[0].version) || 0
      : 0

  const version = latestVersion + 1

  /*
   * Create the document metadata row first.
   *
   * This gives us the UUID that becomes part of the
   * private Storage path.
   */
  const { data: documentRow, error: insertError } =
    await supabase
      .from('documents')
      .insert({
        user_id: user.id,
        employee_id: employeeId,
        employee_name: employeeName,
        document_type: documentType,
        version,
        files: [],
      })
      .select('*')
      .single()

  if (insertError) {
    throw new Error(insertError.message)
  }

  const documentId = documentRow.id
  const uploadedFiles = []

  try {
    for (const file of files) {
      if (!file?.blob) {
        throw new Error(
          `Generated file is missing for ${file?.filename || 'unknown file'}.`
        )
      }

      const safeFilename =
        typeof file.filename === 'string' && file.filename.trim()
          ? file.filename.trim()
          : `${file.kind || 'document'}.docx`

      const storagePath = `${user.id}/${documentId}/${safeFilename}`

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, file.blob, {
          contentType:
            file.blob.type ||
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          upsert: false,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      uploadedFiles.push({
        kind: file.kind || 'docx',
        filename: safeFilename,
        path: storagePath,
      })
    }

    /*
     * Save Storage references in the database.
     */
    const { data: updatedRow, error: updateError } =
      await supabase
        .from('documents')
        .update({
          files: uploadedFiles,
        })
        .eq('id', documentId)
        .eq('user_id', user.id)
        .select('*')
        .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    return fromDatabaseDocument(updatedRow)
  } catch (error) {
    /*
     * If Storage upload or metadata update fails,
     * clean up anything that was already uploaded.
     */
    if (uploadedFiles.length > 0) {
      await supabase.storage
        .from(STORAGE_BUCKET)
        .remove(uploadedFiles.map((file) => file.path))
    }

    await supabase
      .from('documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id)

    throw error
  }
}

/**
 * Downloads a generated DOCX from private Supabase Storage.
 */
export async function getHistoryFileBlob(fileRef) {
  if (!fileRef?.path) {
    throw new Error('Document file reference is missing.')
  }

  const user = await getCurrentUser()

  /*
   * Extra client-side ownership check.
   *
   * RLS/storage policies remain the real security boundary.
   */
  const expectedPrefix = `${user.id}/`

  if (!fileRef.path.startsWith(expectedPrefix)) {
    throw new Error('You do not have access to this document.')
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .download(fileRef.path)

  if (error) {
    throw new Error(error.message)
  }

  return data
}

/**
 * Deletes a complete document history record
 * and all corresponding DOCX files from Storage.
 */
export async function deleteHistoryRecord(id) {
  if (!id) return false

  const user = await getCurrentUser()

  const { data: record, error: fetchError } = await supabase
    .from('documents')
    .select('files')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (fetchError) {
    throw new Error(fetchError.message)
  }

  if (!record) {
    return false
  }

  const files = Array.isArray(record.files)
    ? record.files
    : []

  const storagePaths = files
    .map((file) => file?.path)
    .filter(Boolean)

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove(storagePaths)

    if (storageError) {
      throw new Error(storageError.message)
    }
  }

  const { error: deleteError } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (deleteError) {
    throw new Error(deleteError.message)
  }

  return true
} 