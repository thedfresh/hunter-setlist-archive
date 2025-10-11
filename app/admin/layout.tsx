import AdminPageLayout from '@/components/admin/AdminPageLayout';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminPageLayout>{children}</AdminPageLayout>;
}