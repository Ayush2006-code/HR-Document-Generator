import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Eye,
  Download,
  RefreshCw,
  Trash2,
  FileText,
  MoreHorizontal,
} from 'lucide-react'
import Modal from './Modal.jsx'
import DocumentPreview from './DocumentPreview.jsx'
import {
  getHistoryFileBlob,
  deleteHistoryRecord,
} from '../services/documentHistoryStorage.js'
import { downloadBlob } from '../utils/fileNaming.js'
import { DOCUMENT_TYPE_LABELS } from '../config/documentFields.js'
import { describeError } from '../utils/errors.js'
import { useToast } from '../context/ToastContext.jsx'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const REGENERATE_PATH = {
  offer: '/generate/offer-letter',
  appointment: '/generate/appointment-letter',
  salary_slip: '/generate/salary-slip',
}

export default function DocumentHistoryTable({
  records,
  onDeleted,
}) {
  const navigate = useNavigate()
  const { notify } = useToast()

  const [previewBlob, setPreviewBlob] = useState(null)
  const [previewTitle, setPreviewTitle] = useState('')
  const [deletingId, setDeletingId] = useState(null)
  const [menuFor, setMenuFor] = useState(null)

  async function handlePreview(fileRef, label) {
    try {
      const blob = await getHistoryFileBlob(fileRef)

      if (!blob) {
        notify(
          'This document file could not be found in Supabase Storage.',
          'error'
        )
        return
      }

      setPreviewBlob(blob)
      setPreviewTitle(label)
      setMenuFor(null)
    } catch (err) {
      notify(
        describeError(
          err,
          'Could not open this document for preview.'
        ),
        'error'
      )
    }
  }

  async function handleDownload(fileRef) {
    try {
      const blob = await getHistoryFileBlob(fileRef)

      if (!blob) {
        notify(
          'This document file could not be found in Supabase Storage.',
          'error'
        )
        return
      }

      downloadBlob(blob, fileRef.filename)
      setMenuFor(null)
    } catch (err) {
      notify(
        describeError(
          err,
          'Could not download this document.'
        ),
        'error'
      )
    }
  }

  async function handleDelete(record) {
    const confirmed = window.confirm(
      `Delete this ${
        DOCUMENT_TYPE_LABELS[record.documentType] ||
        'document'
      } history record for ${
        record.employeeName
      }? This will also remove its stored file from Supabase Storage.`
    )

    if (!confirmed) return

    setDeletingId(record.id)
    setMenuFor(null)

    try {
      await deleteHistoryRecord(record.id)

      notify(
        'Document history record deleted.',
        'success'
      )

      if (typeof onDeleted === 'function') {
        onDeleted(record.id)
      }
    } catch (err) {
      notify(
        describeError(
          err,
          'Could not delete this document history record.'
        ),
        'error'
      )
    } finally {
      setDeletingId(null)
    }
  }

  function handleRegenerate(record) {
    setMenuFor(null)

    const path =
      REGENERATE_PATH[record.documentType]

    if (!path || !record.employeeId) {
      notify(
        'This document cannot be regenerated because the employee information is missing.',
        'error'
      )
      return
    }

    navigate(
      `${path}?employeeId=${encodeURIComponent(
        record.employeeId
      )}`
    )
  }

  if (!records || records.length === 0) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl bg-white px-6 py-12 text-center shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <FileText size={20} />
        </div>

        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
          No documents yet
        </h3>

        <p className="mt-1 max-w-sm text-sm leading-6 text-slate-500 dark:text-slate-400">
          Generated HR documents will appear here so you can
          preview, download or regenerate them later.
        </p>
      </div>
    )
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800 md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/40">
                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Employee
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Document
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Generated
                </th>

                <th className="px-5 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Version
                </th>

                <th className="px-5 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {records.map((record) => {
                const documentLabel =
                  DOCUMENT_TYPE_LABELS[
                    record.documentType
                  ] || record.documentType

                const isDeleting =
                  deletingId === record.id

                return (
                  <tr
                    key={record.id}
                    className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                          {(record.employeeName || '?')
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-900 dark:text-white">
                            {record.employeeName}
                          </p>

                          {record.employeeId && (
                            <p className="mt-0.5 text-xs text-slate-400">
                              {record.employeeId}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {documentLabel}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                      {formatDate(record.generatedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        v{record.version}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {Array.isArray(record.files) &&
                          record.files.map(
                            (fileRef, index) => (
                              <span
                                key={
                                  fileRef.path ||
                                  fileRef.filename ||
                                  `${record.id}-file-${index}`
                                }
                                className="flex items-center gap-1"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    handlePreview(
                                      fileRef,
                                      `${record.employeeName} — ${documentLabel}`
                                    )
                                  }
                                  disabled={isDeleting}
                                  className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-blue-600 transition-colors hover:bg-blue-50 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                                >
                                  <Eye size={14} />
                                  Preview
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleDownload(
                                      fileRef
                                    )
                                  }
                                  disabled={isDeleting}
                                  className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                                >
                                  <Download size={14} />
                                  Download
                                </button>
                              </span>
                            )
                          )}

                        {REGENERATE_PATH[
                          record.documentType
                        ] && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRegenerate(
                                record
                              )
                            }
                            disabled={isDeleting}
                            className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                            title="Open the generator pre-filled with this employee"
                          >
                            <RefreshCw size={14} />
                            Regenerate
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            handleDelete(record)
                          }
                          disabled={isDeleting}
                          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-rose-500 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-500/10"
                          title="Delete this history record and its stored files"
                        >
                          <Trash2 size={14} />

                          {isDeleting
                            ? 'Deleting...'
                            : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile */}
      <div className="space-y-3 md:hidden">
        {records.map((record) => {
          const documentLabel =
            DOCUMENT_TYPE_LABELS[
              record.documentType
            ] || record.documentType

          const isDeleting =
            deletingId === record.id

          return (
            <div
              key={record.id}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-900 dark:ring-slate-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <FileText size={18} />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {record.employeeName}
                    </p>

                    <p className="mt-0.5 text-xs text-slate-400">
                      {record.employeeId ||
                        'No employee ID'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setMenuFor(
                      menuFor === record.id
                        ? null
                        : record.id
                    )
                  }
                  disabled={isDeleting}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                  title="More actions"
                >
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Document
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {documentLabel}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Generated
                  </p>

                  <p className="mt-1 text-xs font-medium text-slate-700 dark:text-slate-300">
                    {formatDate(
                      record.generatedAt
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Version
                  </p>

                  <p className="mt-1 font-mono text-xs font-medium text-slate-700 dark:text-slate-300">
                    v{record.version}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-slate-100 pt-3 dark:border-slate-800">
                {Array.isArray(record.files) &&
                  record.files.map(
                    (fileRef, index) => (
                      <span
                        key={
                          fileRef.path ||
                          fileRef.filename ||
                          `${record.id}-mobile-file-${index}`
                        }
                        className="flex items-center gap-1"
                      >
                        <button
                          type="button"
                          onClick={() =>
                            handlePreview(
                              fileRef,
                              `${record.employeeName} — ${documentLabel}`
                            )
                          }
                          disabled={isDeleting}
                          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                        >
                          <Eye size={13} />
                          Preview
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            handleDownload(
                              fileRef
                            )
                          }
                          disabled={isDeleting}
                          className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                        >
                          <Download size={13} />
                          Download
                        </button>
                      </span>
                    )
                  )}

                {REGENERATE_PATH[
                  record.documentType
                ] && (
                  <button
                    type="button"
                    onClick={() =>
                      handleRegenerate(record)
                    }
                    disabled={isDeleting}
                    className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-white"
                  >
                    <RefreshCw size={13} />
                    Regenerate
                  </button>
                )}

                <button
                  type="button"
                  onClick={() =>
                    handleDelete(record)
                  }
                  disabled={isDeleting}
                  className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium text-rose-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50 dark:hover:bg-rose-500/10"
                >
                  <Trash2 size={13} />

                  {isDeleting
                    ? 'Deleting...'
                    : 'Delete'}
                </button>
              </div>

              {/* Mobile overflow menu */}
              {menuFor === record.id && (
                <div className="mt-2 rounded-xl bg-slate-50 p-2 dark:bg-slate-800">
                  <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Document actions
                  </p>

                  {REGENERATE_PATH[
                    record.documentType
                  ] && (
                    <button
                      type="button"
                      onClick={() =>
                        handleRegenerate(
                          record
                        )
                      }
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-medium text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <RefreshCw size={13} />
                      Regenerate
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setMenuFor(null)
                      handleDelete(record)
                    }}
                    disabled={isDeleting}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-medium text-rose-500 hover:bg-white dark:hover:bg-slate-700"
                  >
                    <Trash2 size={13} />
                    Delete history
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Preview modal */}
      {previewBlob && (
        <Modal
          title={previewTitle}
          onClose={() =>
            setPreviewBlob(null)
          }
          wide
        >
          <DocumentPreview
            blob={previewBlob}
          />
        </Modal>
      )}
    </>
  )
}