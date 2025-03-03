import { v4 as uuidv4 } from "uuid";
import {
  json,
  redirect,
  type MetaFunction,
  type ActionFunctionArgs,
} from "@remix-run/node";
import { CreateProjectForm } from "~/components/Forms/CreateProjectForm";
import { insertProject } from "~/lib/db/db.server";

export const meta: MetaFunction = () => {
  return [
    { title: "Create New Project" },
    { name: "description", content: "Create a new project" },
  ];
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!id || !name) {
    return json({ error: "ID and name are required" }, { status: 400 });
  }

  const now = new Date();
  const uuid = uuidv4();

  // Insert the project into the database
  const project = {
    uuid,
    id,
    name,
    description: description || "",
    createdAt: now,
    updatedAt: now,
  };

  await insertProject(project);

  // Redirect to the new project page
  return redirect(`/new-project/${id}`);
}

export default function NewProject() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        Create a New Project
      </h1>
      <CreateProjectForm />
    </div>
  );
}
