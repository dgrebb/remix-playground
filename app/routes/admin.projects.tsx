import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { useLoaderData, Link, Form, useSubmit } from "@remix-run/react";
import { useState } from "react";
import {
  getAllProjects,
  deleteProject,
  deleteProjects,
} from "~/lib/db/db.server";

// Define our loader type
type ProjectFromDb = {
  uuid: string;
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
};

type Project = {
  uuid: string;
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

type LoaderData = {
  projects: Project[];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const projects = (await getAllProjects()) as ProjectFromDb[];

  // Format dates for display
  const formattedProjects = projects.map((project) => ({
    ...project,
    createdAt: new Date(project.createdAt).toISOString(),
    updatedAt: new Date(project.updatedAt).toISOString(),
  }));

  return json({ projects: formattedProjects });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "delete") {
    const uuid = formData.get("uuid") as string;
    if (uuid) {
      await deleteProject(uuid);
    }
  } else if (intent === "delete-selected") {
    const selectedIds = formData.getAll("selected") as string[];
    if (selectedIds.length) {
      await deleteProjects(selectedIds);
    }
  }

  return json({ success: true });
}

export default function AdminProjects() {
  const { projects } = useLoaderData<typeof loader>() as LoaderData;
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const submit = useSubmit();

  const handleSelectAll = () => {
    if (selectedRows.length === projects.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(projects.map((project) => project.uuid));
    }
  };

  const handleSelectRow = (uuid: string) => {
    if (selectedRows.includes(uuid)) {
      setSelectedRows(selectedRows.filter((id) => id !== uuid));
    } else {
      setSelectedRows([...selectedRows, uuid]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedRows.length === 0) return;

    if (
      confirm(
        `Are you sure you want to delete ${selectedRows.length} project(s)?`
      )
    ) {
      const formData = new FormData();
      formData.append("intent", "delete-selected");

      selectedRows.forEach((id) => {
        formData.append("selected", id);
      });

      submit(formData, { method: "post" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Projects</h2>

      <div className="mb-4 flex justify-between items-center">
        <div>
          <span className="text-gray-500 dark:text-gray-400">
            {projects.length} projects
          </span>
        </div>
        <div className="flex gap-2">
          <Link
            to="/new-project"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            New Project
          </Link>

          <button
            type="button"
            onClick={handleDeleteSelected}
            disabled={selectedRows.length === 0}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Delete Selected
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th scope="col" className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={
                    selectedRows.length === projects.length &&
                    projects.length > 0
                  }
                  onChange={handleSelectAll}
                  className="rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                />
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Created
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Updated
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {projects.map((project) => (
              <tr
                key={project.uuid}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedRows.includes(project.uuid)}
                    onChange={() => handleSelectRow(project.uuid)}
                    className="rounded text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                  {project.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {project.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {formatDate(project.createdAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {formatDate(project.updatedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  <div className="flex space-x-2">
                    <Link
                      to={`/new-project/${project.id}`}
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      View
                    </Link>
                    <Form method="post" className="inline">
                      <input type="hidden" name="uuid" value={project.uuid} />
                      <input type="hidden" name="intent" value="delete" />
                      <button
                        type="submit"
                        onClick={(e) => {
                          if (
                            !confirm(
                              "Are you sure you want to delete this project?"
                            )
                          ) {
                            e.preventDefault();
                          }
                        }}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </Form>
                  </div>
                </td>
              </tr>
            ))}

            {projects.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                >
                  No projects found.{" "}
                  <Link to="/new-project" className="text-blue-600">
                    Create one
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
