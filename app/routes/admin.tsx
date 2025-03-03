import { Outlet } from "@remix-run/react";

export default function AdminLayout() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Admin Panel</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Manage your application data and settings
        </p>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}
