import { supabase } from './supabaseClient.js'

function toDatabaseEmployee(employee, userId) {
  return {
    user_id: userId,

    salutation: employee.salutation ?? '',
    employee_name: employee.employeeName ?? '',
    employee_id: employee.employeeId ?? '',
    department: employee.department ?? '',
    address: employee.address ?? '',
    designation: employee.designation ?? '',
    grade: employee.grade ?? '',
    location: employee.location ?? '',
    email: employee.email ?? '',
    phone: employee.phone ?? '',

    offer_date: employee.offerDate ?? '',
    appointment_date: employee.appointmentDate ?? '',
    joining_date: employee.joiningDate ?? '',
    offer_valid_till: employee.offerValidTill ?? '',
    probation_period: employee.probationPeriod ?? '',
    notice_period: employee.noticePeriod ?? '',

    salary: employee.salary ?? {},
  }
}

function fromDatabaseEmployee(row) {
  if (!row) return null

  return {
    id: row.id,

    salutation: row.salutation ?? '',
    employeeName: row.employee_name ?? '',
    employeeId: row.employee_id ?? '',
    department: row.department ?? '',
    address: row.address ?? '',
    designation: row.designation ?? '',
    grade: row.grade ?? '',
    location: row.location ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',

    offerDate: row.offer_date ?? '',
    appointmentDate: row.appointment_date ?? '',
    joiningDate: row.joining_date ?? '',
    offerValidTill: row.offer_valid_till ?? '',
    probationPeriod: row.probation_period ?? '',
    noticePeriod: row.notice_period ?? '',

    salary: row.salary ?? {},

    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  if (!user) {
    throw new Error('You must be signed in to manage employees.')
  }

  return user
}

export async function listEmployees() {
  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('user_id', user.id)
    .order('employee_name', {
      ascending: true,
    })

  if (error) {
    throw new Error(error.message)
  }

  return (data || []).map(fromDatabaseEmployee)
}

export async function getEmployee(id) {
  if (!id) return null

  const user = await getCurrentUser()

  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  return fromDatabaseEmployee(data)
}

export async function saveEmployee(employee) {
  if (!employee) {
    throw new Error('Employee data is required.')
  }

  const user = await getCurrentUser()

  const payload = toDatabaseEmployee(employee, user.id)

  /*
   * Existing localStorage records used IDs such as:
   * emp_123456_xxxxx
   *
   * Supabase now uses UUIDs.
   *
   * If an old/local ID is passed, treat it as a new employee
   * instead of attempting to update a UUID column.
   */
  const isSupabaseId =
    typeof employee.id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      employee.id
    )

  if (isSupabaseId) {
    const { data, error } = await supabase
      .from('employees')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', employee.id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return fromDatabaseEmployee(data)
  }

  const { data, error } = await supabase
    .from('employees')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return fromDatabaseEmployee(data)
}

export async function deleteEmployee(id) {
  if (!id) return false

  const user = await getCurrentUser()

  /*
   * Old localStorage employee IDs are not present in Supabase,
   * so there is nothing to delete for those IDs.
   */
  const isSupabaseId =
    typeof id === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      id
    )

  if (!isSupabaseId) {
    return false
  }

  const { error } = await supabase
    .from('employees')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    throw new Error(error.message)
  }

  return true
}