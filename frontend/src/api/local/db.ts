import type { Admin, Department, Employee } from '../types'

export interface AppDb {
  admins: (Admin & { password: string })[]
  departments: Department[]
  employees: Employee[]
  seq: number
}

const STORAGE_KEY = 'ks.app.db'

const departments: Department[] = [
  { id: 'dep-1', name: 'Engineering' },
  { id: 'dep-2', name: 'Sales' },
  { id: 'dep-3', name: 'Marketing' },
  { id: 'dep-4', name: 'Human Resources' },
  { id: 'dep-5', name: 'Finance' },
  { id: 'dep-6', name: 'Operations' },
]

const designations = [
  'Software Engineer',
  'Senior Software Engineer',
  'Tech Lead',
  'Product Manager',
  'Sales Executive',
  'Account Manager',
  'Marketing Specialist',
  'HR Executive',
  'Financial Analyst',
  'Operations Associate',
]

const firstNames = [
  'Aarav',
  'Priya',
  'Rohan',
  'Ananya',
  'Vikram',
  'Meera',
  'Arjun',
  'Kavya',
  'Rahul',
]

const lastNames = ['Sharma', 'Patel', 'Reddy', 'Nair', 'Iyer', 'Gupta', 'Singh', 'Mehta', 'Kapoor']

function seedEmployees(): Employee[] {
  const list: Employee[] = []
  const now = new Date('2026-09-01T10:00:00Z').toISOString()

  for (let i = 0; i < firstNames.length; i++) {
    const first = firstNames[i]
    const last = lastNames[i % lastNames.length]
    const dept = departments[i % departments.length]
    const joinYear = 2020 + (i % 6)
    const joinMonth = String(((i * 3) % 12) + 1).padStart(2, '0')
    const joinDay = String(((i * 7) % 27) + 1).padStart(2, '0')

    list.push({
      id: `emp-${i + 1}`,
      empId: `KS-${String(1001 + i)}`,
      fullName: `${first} ${last}`,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@kloudspot.com`,
      phoneNumber: `+91 9${String(800000000 + i * 1234567).slice(0, 9)}`,
      departmentId: dept.id,
      departmentName: dept.name,
      designation: designations[i % designations.length],
      dateOfJoining: `${joinYear}-${joinMonth}-${joinDay}`,
      salary: 600000 + (i % 8) * 85000,
      status: i % 7 !== 3,
      createdBy: 'admin-1',
      createdAt: now,
      updatedAt: now,
      updatedBy: 'admin-1',
    })
  }
  return list
}

function freshDb(): AppDb {
  return {
    admins: [
      {
        id: 'admin-1',
        name: 'Vagish G',
        email: 'admin@kloudspot.com',
        password: 'admin123',
        createdAt: new Date('2026-01-05T09:00:00Z').toISOString(),
      },
    ],
    departments,
    employees: seedEmployees(),
    seq: firstNames.length + 1,
  }
}

export function loadDb(): AppDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppDb
      if (parsed.employees?.length && parsed.admins?.length) return parsed
    }
  } catch {
    // bad data in storage, just reseed
  }
  const db = freshDb()
  saveDb(db)
  return db
}

export function saveDb(db: AppDb): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // ignore, keep running from memory
  }
}
