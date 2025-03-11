import { json, redirect } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { resetDatabase } from "~/lib/db/db.server";

export async function action() {
  try {
    // Reset the database
    const success = resetDatabase();

    if (success) {
      return redirect("/debug?reset=success");
    } else {
      throw new Error("Failed to reset database");
    }
  } catch (error) {
    console.error("Error resetting database:", error);
    return json({ error: "Failed to reset database" }, { status: 500 });
  }
}

export default function DebugReset() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Reset Database</h1>

      <div className="bg-yellow-50 dark:bg-yellow-900 p-4 rounded-md mb-6">
        <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
          ⚠️ Warning
        </h2>
        <p className="text-yellow-700 dark:text-yellow-300 mb-4">
          This action will delete all data in the database and reset it to its
          initial state. This cannot be undone.
        </p>
      </div>

      <Form method="post">
        <div className="flex justify-between">
          <a
            href="/debug"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </a>

          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Reset Database
          </button>
        </div>
      </Form>
    </div>
  );
}
