import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { getAllProjects, sqlite } from "~/lib/db/db.server";
import TransitionLink from "~/components/TransitionLink";

export async function loader() {
  // Get projects using our helper
  const projects = await getAllProjects();

  // Get raw database info for debugging
  const dbInfo = {
    tables: sqlite
      .prepare("SELECT name FROM sqlite_master WHERE type='table'")
      .all(),
    projectsCount: sqlite
      .prepare("SELECT COUNT(*) as count FROM projects")
      .get() as { count: number },
    directProjectsQuery: sqlite.prepare("SELECT * FROM projects").all(),
  };

  return json({
    projects,
    dbInfo,
    timestamp: new Date().toISOString(),
  });
}

export default function DebugPage() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const resetSuccess = searchParams.get("reset") === "success";

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 project-header">
        Database Debug Panel
      </h1>

      {resetSuccess && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
          Database has been successfully reset.
        </div>
      )}

      <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold">Database Info</h2>
          <TransitionLink
            to="/debug/reset"
            className="text-sm bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Reset Database
          </TransitionLink>
        </div>
        <p>
          <strong>Tables:</strong>{" "}
          {(data.dbInfo.tables as any[]).map((t) => t.name).join(", ")}
        </p>
        <p>
          <strong>Projects Count:</strong> {data.dbInfo.projectsCount.count}
        </p>
        <p>
          <strong>Timestamp:</strong> {data.timestamp}
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4 flex justify-between">
          <span>Projects ({data.projects.length})</span>
          <TransitionLink
            to="/new-project"
            className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Create New Project
          </TransitionLink>
        </h2>

        {data.projects.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-200 dark:bg-gray-700">
                  <th className="p-2 text-left">ID</th>
                  <th className="p-2 text-left">UUID</th>
                  <th className="p-2 text-left">Name</th>
                  <th className="p-2 text-left">Created</th>
                  <th className="p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.projects.map((project) => (
                  <tr
                    key={project.uuid}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="p-2">{project.id}</td>
                    <td className="p-2 font-mono text-xs">{project.uuid}</td>
                    <td className="p-2 project-title">{project.name}</td>
                    <td className="p-2">
                      {new Date(project.createdAt).toLocaleString()}
                    </td>
                    <td className="p-2">
                      <TransitionLink
                        to={`/projects/${project.uuid}`}
                        className="text-blue-600 hover:underline transition-link"
                      >
                        View
                      </TransitionLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded">
            No projects found in database.{" "}
            <TransitionLink to="/new-project" className="underline">
              Create your first project
            </TransitionLink>
            .
          </div>
        )}
      </div>

      <details className="mt-8">
        <summary className="cursor-pointer text-md font-semibold mb-2 p-2 bg-gray-200 dark:bg-gray-700 rounded">
          Raw Database Contents (Click to expand)
        </summary>
        <pre className="p-4 bg-gray-100 dark:bg-gray-800 rounded overflow-auto text-xs mt-2">
          {JSON.stringify(data, null, 2)}
        </pre>
      </details>
    </div>
  );
}
