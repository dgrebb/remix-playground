import { createContext, useContext, useState, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";

export interface Project {
  uuid: string;
  id: string;
  name: string;
  description: string;
  requirements?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectContextType {
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
  createProject: (id: string, name: string, description: string) => Project;
  resetProject: () => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  const createProject = (
    id: string,
    name: string,
    description: string
  ): Project => {
    // Create a new project with a UUID and timestamps
    const now = new Date();
    const project: Project = {
      uuid: uuidv4(),
      id,
      name,
      description,
      createdAt: now,
      updatedAt: now,
    };

    // Update the current project state
    setCurrentProject(project);
    return project;
  };

  const resetProject = () => {
    setCurrentProject(null);
  };

  const value = {
    currentProject,
    setCurrentProject,
    createProject,
    resetProject,
  };

  return (
    <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error("useProject must be used within a ProjectProvider");
  }
  return context;
}
