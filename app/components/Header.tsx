import { Link } from "@remix-run/react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">
        <Link to="/">Process Designer</Link>
      </h1>
      <div className="flex items-center gap-4">
        <nav className="hidden md:flex items-center gap-4">
          <Link to="/artifact-composer" className="text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-gray-100">
            Artifact Composer
          </Link>
          {/* <Link to="/process-designer" className="text-gray-700 hover:text-gray-900">
            Process Designer
          </Link>
          <Link to="/process-explorer" className="text-gray-700 hover:text-gray-900">
            Process Explorer
          </Link> */}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
