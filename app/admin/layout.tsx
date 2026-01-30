import Providers from './providers'
import AdminLayoutClient from './layout-client'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <Providers>
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </Providers>
  )
}
