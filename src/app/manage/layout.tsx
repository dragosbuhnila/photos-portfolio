import React from 'react';
import { redirect } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { checkServerAuth } from '@/lib/auth';

export const metadata = {
  title: 'Content Studio — Portfolio Management',
  description: 'Manage projects, images, bio, and resume entries.',
};

export default async function ManageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuth = await checkServerAuth();
  if (!isAuth) {
    redirect('/login?from=/manage');
  }

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-[calc(100vh-140px)]">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
