import Field, { inputClass } from './Field.jsx'
import { SALUTATIONS } from '../config/documentFields.js'

/**
 * Shared employee-details section used by all three generators.
 * `errors` is a { fieldKey: message } map from the caller's validation pass.
 */
export default function EmployeeForm({
  value,
  onChange,
  errors = {},
}) {
  function set(key, val) {
    onChange({
      ...value,
      [key]: val,
    })
  }

  return (
    <div className="space-y-7">
      {/* Basic information */}
      <section>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">
            Basic information
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Employee identity and internal reference details.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Salutation">
              <select
                className={inputClass(false)}
                value={value.salutation || 'Mr.'}
                onChange={(e) =>
                  set('salutation', e.target.value)
                }
              >
                {SALUTATIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>

            <div className="sm:col-span-2">
              <Field
                label="Employee Name"
                required
                error={errors.employeeName}
              >
                <input
                  className={inputClass(
                    errors.employeeName
                  )}
                  value={value.employeeName || ''}
                  onChange={(e) =>
                    set(
                      'employeeName',
                      e.target.value
                    )
                  }
                  placeholder="e.g. Rahul Sharma"
                />
              </Field>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Employee ID"
              hint="Tracked internally; not printed on legal document body."
            >
              <input
                className={inputClass(false)}
                value={value.employeeId || ''}
                onChange={(e) =>
                  set(
                    'employeeId',
                    e.target.value
                  )
                }
                placeholder="e.g. EMP-1042"
              />
            </Field>

            <Field
              label="Department"
              hint="Tracked internally; not printed on legal document body."
            >
              <input
                className={inputClass(false)}
                value={value.department || ''}
                onChange={(e) =>
                  set(
                    'department',
                    e.target.value
                  )
                }
                placeholder="e.g. Retail Operations"
              />
            </Field>
          </div>
        </div>
      </section>

      {/* Address */}
      <section>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">
            Address
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Employee address used when required by the document.
          </p>
        </div>

        <Field label="Address">
          <textarea
            className={inputClass(false)}
            rows={3}
            value={value.address || ''}
            onChange={(e) =>
              set('address', e.target.value)
            }
            placeholder="Defaults to Branch & Location if left blank"
          />
        </Field>
      </section>

      {/* Employment details */}
      <section>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">
            Employment details
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Role, grade and workplace information.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field
              label="Designation"
              required
              error={errors.designation}
            >
              <input
                className={inputClass(
                  errors.designation
                )}
                value={value.designation || ''}
                onChange={(e) =>
                  set(
                    'designation',
                    e.target.value
                  )
                }
                placeholder="e.g. Store Manager"
              />
            </Field>

            <Field label="Grade">
              <input
                className={inputClass(false)}
                value={
                  value.grade || 'As per Policy'
                }
                onChange={(e) =>
                  set('grade', e.target.value)
                }
              />
            </Field>
          </div>

          <Field
            label="Branch & Location"
            required
            error={errors.location}
          >
            <input
              className={inputClass(
                errors.location
              )}
              value={value.location || ''}
              onChange={(e) =>
                set(
                  'location',
                  e.target.value
                )
              }
              placeholder="e.g. South Delhi"
            />
          </Field>
        </div>
      </section>

      {/* Contact details */}
      <section>
        <div className="mb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">
            Contact details
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Optional employee contact information.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Email"
            error={errors.email}
          >
            <input
              type="email"
              className={inputClass(errors.email)}
              value={value.email || ''}
              onChange={(e) =>
                set('email', e.target.value)
              }
              placeholder="name@company.com"
            />
          </Field>

          <Field
            label="Phone"
            error={errors.phone}
          >
            <input
              className={inputClass(errors.phone)}
              value={value.phone || ''}
              onChange={(e) =>
                set('phone', e.target.value)
              }
              placeholder="+91 98765 43210"
            />
          </Field>
        </div>
      </section>
    </div>
  )
}