import { ReactNode } from 'react';
import { AdminHeader } from '../admin/AdminHeader';
import { AdminSidebar } from '../admin/AdminSidebar';
import Footer from '../ui-kit/footer/Footer';

interface IAdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: IAdminLayoutProps) => {
  return (
    <div className="flex min-h-full flex-col">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <div className="min-w-0 flex-1 p-6">{children}</div>
      </div>
      <Footer />
    </div>
  );
};
