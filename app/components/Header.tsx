import { Link } from "@remix-run/react";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  return (
    <header className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">
        <Link to="/form-builder">Prompt Designer</Link>
      </h1>
      <ThemeToggle />
    </header>
  );
}
