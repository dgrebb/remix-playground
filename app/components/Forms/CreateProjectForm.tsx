import { Form, useNavigate, useSubmit } from "@remix-run/react";
import { useState } from "react";
import { useProject } from "~/contexts/ProjectContext";

export function CreateProjectForm() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createProject } = useProject();
  const navigate = useNavigate();
  const submit = useSubmit();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id || !name) return;

    setIsSubmitting(true);

    try {
      // Create the project in context for client-side state
      createProject(id, name, description);

      // Submit the form data to the server via Remix action
      const formData = new FormData();
      formData.append("id", id);
      formData.append("name", name);
      formData.append("description", description);

      // Use Remix's submit function to send data to the server
      submit(formData, { method: "post" });

      // Navigate to the new project page
      navigate(`/new-project/${id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form
      method="post"
      onSubmit={handleSubmit}
      className="space-y-6 max-w-md mx-auto"
    >
      <div className="grid gap-2">
        <label
          htmlFor="id"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Project ID
        </label>
        <input
          id="id"
          name="id"
          type="text"
          value={id}
          onChange={(e) => setId(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
          placeholder="my-project-id"
          required
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="name"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Project Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
          placeholder="My Awesome Project"
          required
        />
      </div>

      <div className="grid gap-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800"
          placeholder="Enter project description"
          rows={3}
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {isSubmitting ? "Creating..." : "Create Project"}
      </button>
    </Form>
  );
}
