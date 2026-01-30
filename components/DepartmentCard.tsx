'use client'

interface DepartmentCardProps {
  department: string
  cityCount: number
  businessCount: number
}

export default function DepartmentCard({ department, cityCount, businessCount }: DepartmentCardProps) {
  const scrollToDepartment = () => {
    const element = document.getElementById(`dept-${department}`)
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow overflow-hidden">
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{department}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <p>📍 {cityCount} ville{cityCount > 1 ? 's' : ''}</p>
          {businessCount > 0 && (
            <p>🏢 {businessCount} entreprise{businessCount > 1 ? 's' : ''}</p>
          )}
        </div>
      </div>
      <button
        onClick={scrollToDepartment}
        className="w-full bg-gray-50 hover:bg-gray-100 px-6 py-3 text-sm font-semibold text-gray-700 transition-colors"
      >
        Voir les villes →
      </button>
    </div>
  )
}
