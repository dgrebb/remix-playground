import type { MetaFunction } from "@remix-run/node";
import TransitionLink from "~/components/TransitionLink";

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
    <div className="p-10 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tight mb-4 project-header">
          Welcome to Remix Playground
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 project-description">
          A sandbox for experimenting with Remix features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
          title="Create New Project"
          description="Start a new project with a custom name and settings"
          to="/new-project"
          buttonText="New Project"
        />

        <Card
          title="Debug Database"
          description="View database contents and diagnostic information"
          to="/debug"
          buttonText="View Debug Panel"
        />
      </div>
    </div>
  );
}

function Card({
  title,
  description,
  to,
  buttonText,
}: {
  title: string;
  description: string;
  to: string;
  buttonText: string;
}) {
  return (
    <div className="project-card bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-2 project-title">{title}</h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 project-description">
        {description}
      </p>
      <TransitionLink
        to={to}
        className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition duration-150 ease-in-out"
      >
        {buttonText}
      </TransitionLink>
    </div>
  );
}
