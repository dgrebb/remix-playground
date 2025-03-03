import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "Remix Playground" },
    {
      name: "description",
      content: "Project management and development tools",
    },
  ];
};

export default function Index() {
  return (
    <div className="max-w-4xl mx-auto text-center py-12">
      <h1 className="text-4xl font-bold mb-6">Welcome to Remix Playground</h1>
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-10">
        A development platform for exploring Remix features and building
        projects
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        <Link
          to="/new-project"
          className="p-6 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex flex-col items-center justify-center space-y-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M11 12H3M11 6h-8m8 12H3M21 12h-6m6-6h-6m6 12h-6M15 9l3 3-3 3" />
          </svg>
          <span className="text-xl font-medium">Create New Project</span>
          <span className="text-sm opacity-80">
            Start building something awesome
          </span>
        </Link>

        <Link
          to="/admin"
          className="p-6 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors flex flex-col items-center justify-center space-y-3"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 4.5a2 2 0 0 0-2 2v3a2 2 0 0 0 4 0v-3a2 2 0 0 0-2-2z" />
            <circle cx="12" cy="14" r="8" />
            <path d="M12 14v4" />
            <path d="M16 16 8 12" />
          </svg>
          <span className="text-xl font-medium">Admin Panel</span>
          <span className="text-sm opacity-80">
            Manage your projects and settings
          </span>
        </Link>
      </div>
    </div>
  );
}
