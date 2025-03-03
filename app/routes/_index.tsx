import type { MetaFunction } from "@remix-run/node";
import { CreateProjectForm } from "~/components/Forms/CreateProjectForm";

export const meta: MetaFunction = () => {
  return [
    { title: "Create Project" },
    { name: "description", content: "Create a new project" },
  ];
};

export default function Index() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">
        Create a New Project
      </h1>
      <CreateProjectForm />
    </div>
  );
}
