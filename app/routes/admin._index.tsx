import { Link } from "@remix-run/react";

export default function AdminIndex() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Project Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Create, view, and manage projects in the database.
          </p>
          <Link
            to="/admin/projects"
            className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Manage Projects
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">User Management</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Manage user accounts and permissions (coming soon).
          </p>
          <button
            disabled
            className="inline-block px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Site Settings</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Configure global site settings (coming soon).
          </p>
          <button
            disabled
            className="inline-block px-4 py-2 bg-gray-400 text-white rounded-md cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Database Status</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Database Type
            </h3>
            <p className="mt-1 text-lg">SQLite</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Connection Status
            </h3>
            <p className="mt-1 flex items-center">
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-2"></span>
              Connected
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Database Location
            </h3>
            <p className="mt-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded">
              ./data/db.sqlite
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Tables
            </h3>
            <p className="mt-1">1 table (projects)</p>
          </div>
        </div>
      </div>
    </div>
  );
}
