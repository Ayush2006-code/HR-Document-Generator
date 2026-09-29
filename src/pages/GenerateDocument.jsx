import { Routes, Route, useLocation } from 'react-router-dom'
import OfferLetterGenerator from '../components/OfferLetterGenerator.jsx'
import AppointmentLetterGenerator from '../components/AppointmentLetterGenerator.jsx'
import SalarySlipGenerator from '../components/SalarySlipGenerator.jsx'
import GenerateAllGenerator from '../components/GenerateAllGenerator.jsx'

const TITLES = {
  '/generate/offer': 'Offer Letter Generator',
  '/generate/appointment': 'Appointment Letter Generator',
  '/generate/salary-slip': 'Salary Slip Generator',
  '/generate/all': 'Generate All Documents',
}

export function useGenerateTitle() {
  const location = useLocation()
  return TITLES[location.pathname] || 'Generate Document'
}

export default function GenerateDocument() {
  return (
    <div className="min-h-full bg-slate-50 dark:bg-slate-950">
      <main className="mx-auto w-full max-w-7xl px-5 py-6 sm:px-7 sm:py-8 lg:px-10 lg:py-9">
        <Routes>
          <Route
            path="offer"
            element={<OfferLetterGenerator />}
          />

          <Route
            path="appointment"
            element={<AppointmentLetterGenerator />}
          />

          <Route
            path="salary-slip"
            element={<SalarySlipGenerator />}
          />

          <Route
            path="all"
            element={<GenerateAllGenerator />}
          />
        </Routes>
      </main>
    </div>
  )
}