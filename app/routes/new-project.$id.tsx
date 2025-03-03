import { Link, useNavigate, useParams } from "@remix-run/react";
import { useEffect } from "react";
import { useProject } from "~/contexts/ProjectContext";

export default function ProjectDetails() {
  const { id } = useParams();
  const { currentProject } = useProject();
  const navigate = useNavigate();

  // Redirect to home if no project is selected
  useEffect(() => {
    if (!currentProject || currentProject.id !== id) {
      navigate("/");
    }
  }, [currentProject, id, navigate]);

  if (!currentProject) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Link
          to="/"
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          ← Back to Projects
        </Link>

        <h1 className="text-3xl font-bold">Project Details</h1>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Project Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  ID
                </label>
                <p className="mt-1 text-lg">{currentProject.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </label>
                <p className="mt-1 text-lg">{currentProject.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </label>
                <p className="mt-1">
                  {currentProject.description || "No description provided."}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
              Project Details
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  UUID
                </label>
                <p className="mt-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 p-2 rounded-md overflow-x-auto">
                  {currentProject.uuid}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created
                </label>
                <p className="mt-1">
                  {new Date(currentProject.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Updated
                </label>
                <p className="mt-1">
                  {new Date(currentProject.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
