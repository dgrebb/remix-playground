import { Outlet } from "@remix-run/react";

export default function NewProjectLayout() {
  return (
    <div className="space-y-6">
      <Outlet />
    </div>
  );
}
