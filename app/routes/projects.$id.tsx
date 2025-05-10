import { json, LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
  Form,
  useSubmit,
  useNavigation,
} from "@remix-run/react";
import {
  getProjectById,
  updateProjectRequirements,
  type Project,
} from "~/lib/db/db.server";
import { useProject } from "~/contexts/ProjectContext";
import { useEffect, useState } from "react";
import TransitionLink from "~/components/TransitionLink";
import { MarkdownEditor } from "~/components/MarkdownEditor";

// Define the loader data type
type LoaderData = {
  project: Project;
};

export async function loader({ params }: LoaderFunctionArgs) {
  const { id } = params;

  if (!id) {
    console.log("❌ No ID provided in URL params");
    throw new Response("Project ID is required", { status: 400 });
  }

  console.log(`🔍 Looking up project with ID: "${id}"`);

  // Try to find the project
  const project = await getProjectById(id);

  if (!project) {
    console.log(`❌ Project not found with ID: "${id}"`);
    throw new Response("Project not found", { status: 404 });
  }

  console.log(
    `✅ Found project: ${project.name} (ID: ${project.id}, UUID: ${project.uuid})`
  );
  return json({ project });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { id } = params;
  if (!id) {
    throw new Response("Project ID is required", { status: 400 });
  }

  const formData = await request.formData();
  const requirements = formData.get("requirements") as string;

  const updatedProject = await updateProjectRequirements(id, requirements);

  if (!updatedProject) {
    throw new Response("Failed to update project requirements", {
      status: 500,
    });
  }

  return json({ success: true, project: updatedProject });
}

export default function ProjectDetails() {
  const { project } = useLoaderData<typeof loader>() as LoaderData;
  const { setCurrentProject } = useProject();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [requirements, setRequirements] = useState(project.requirements || "");
  const [isDirty, setIsDirty] = useState(false);
  const isUpdating = navigation.state === "submitting";

  // Auto-save the requirements after a delay
  useEffect(() => {
    if (isDirty && !isUpdating) {
      const timer = setTimeout(() => {
        handleSave();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [requirements, isDirty, isUpdating]);

  const handleSave = () => {
    const formData = new FormData();
    formData.append("requirements", requirements);
    submit(formData, { method: "post" });
    setIsDirty(false);
  };

  // Sync server data with client context
  useEffect(() => {
    if (project) {
      setCurrentProject({
        ...project,
        // Convert number id to string for the context
        id: String(project.id),
        // Ensure description is always a string
        description: project.description || "",
        // Ensure requirements is always a string
        requirements: project.requirements || "",
        // Convert string dates back to Date objects for the context
        createdAt: new Date(project.createdAt),
        updatedAt: new Date(project.updatedAt),
      });
    }
  }, [project, setCurrentProject]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TransitionLink
            to="/debug"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            ← Back to Projects
          </TransitionLink>

          <h1 className="text-3xl font-bold project-title">{project.name}</h1>
        </div>

        <TransitionLink
          to="/new-project"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          New Project
        </TransitionLink>
      </div>

      <div className="project-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200 project-header">
              Project Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  ID
                </label>
                <p className="mt-1 text-lg">{project.id}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Name
                </label>
                <p className="mt-1 text-lg">{project.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Description
                </label>
                <p className="mt-1 project-description">
                  {project.description || "No description provided."}
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
                  {project.uuid}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Created
                </label>
                <p className="mt-1">
                  {new Date(project.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">
                  Last Updated
                </label>
                <p className="mt-1">
                  {new Date(project.updatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="project-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 transition-all">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
          Requirements Document
        </h2>

        <Form method="post" className="mt-4">
          <MarkdownEditor
            initialValue={requirements}
            onChange={(value) => {
              setRequirements(value);
              setIsDirty(true);
            }}
          />

          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              {isDirty ? "Unsaved changes" : "All changes saved"}
            </p>

            <button
              type="button"
              onClick={handleSave}
              disabled={!isDirty || isUpdating}
              className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                isUpdating ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isUpdating ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  let heading = "Something went wrong";
  let message = "An unexpected error occurred. Please try again later.";

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      heading = "Project not found";
      message =
        "The project you're looking for doesn't exist or may have been deleted.";
    } else if (error.status === 400) {
      heading = "Invalid request";
      message = "The request was invalid. Please try again.";
    }
  }

  return (
    <div className="max-w-4xl mx-auto text-center py-16">
      <div className="mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold mb-2">{heading}</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">{message}</p>
      </div>
      <TransitionLink
        to="/debug"
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
            d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
        Return to Project List
      </TransitionLink>
    </div>
  );
}
