import { json, redirect } from "@remix-run/node";
import { useActionData } from "@remix-run/react";
import { v4 as uuidv4 } from "uuid";
import { CreateProjectForm } from "~/components/Forms/CreateProjectForm";
import { createProject } from "~/lib/db/db.server";
import TransitionLink from "~/components/TransitionLink";

export const action = async ({ request }: { request: Request }) => {
  const formData = await request.formData();
  const id = formData.get("id") as string; // This is just a user-friendly ID, not used in database
  const name = formData.get("name") as string;
  const description = (formData.get("description") as string) || "";

  // Validate input
  if (!id?.trim() || !name?.trim()) {
    return json(
      {
        error: "Project ID and name are required",
        ok: false,
      },
      { status: 400 }
    );
  }

  try {
    // Create project using our updated helper
    const project = await createProject(name, description);
    console.log("Project created:", project);

    // Redirect to the newly created project using the UUID from the database
    return redirect(`/projects/${project.uuid}`);
  } catch (error) {
    console.error("Error creating project:", error);
    return json(
      {
        error: "Failed to create project",
        details: error instanceof Error ? error.message : String(error),
        ok: false,
      },
      { status: 500 }
    );
  }
};

export default function NewProject() {
  const actionData = useActionData<typeof action>();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold project-header">
          Create New Project
        </h1>
        <TransitionLink
          to="/debug"
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
        >
          Back to Projects
        </TransitionLink>
      </div>

      <div className="project-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <CreateProjectForm />

        {actionData?.error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
            {actionData.error}
          </div>
        )}
      </div>
    </div>
  );
}
