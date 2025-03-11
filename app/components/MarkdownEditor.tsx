import React, { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileTextIcon, EyeIcon, UploadIcon } from "lucide-react";
import { useTheme } from "remix-themes";

interface MarkdownEditorProps {
  initialValue?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function MarkdownEditor({
  initialValue = "",
  onChange,
  placeholder = `# Requirements Document

## Project Overview
Brief description of the project and its purpose.

## Functional Requirements
- Requirement 1: Description
- Requirement 2: Description
- Requirement 3: Description

## Technical Requirements
- Technology stack: List technologies to be used
- Performance requirements
- Security requirements

## Timeline
- Phase 1: Start date - End date
- Phase 2: Start date - End date
- Delivery date: MM/DD/YYYY

## Additional Notes
Any other important information about the project.
`,
}: MarkdownEditorProps) {
  const [markdown, setMarkdown] = useState(initialValue);
  const [editMode, setEditMode] = useState(true);
  const [theme] = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMarkdown(newValue);
    onChange(newValue);
  };

  const handleFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Only accept .md or .txt files
    if (!file.name.match(/\.(md|txt)$/i)) {
      alert("Please upload a Markdown (.md) or text (.txt) file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setMarkdown(content);
      onChange(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 border-b">
        <div className="flex items-center space-x-2">
          <h3 className="font-medium">Requirements Document</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleFileUpload}
            className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Upload Markdown file"
            title="Upload Markdown file"
          >
            <UploadIcon className="h-4 w-4" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".md,.txt"
            className="hidden"
          />
          <button
            onClick={() => setEditMode(true)}
            className={`p-1.5 rounded-md ${
              editMode
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            aria-label="Edit mode"
            title="Edit mode"
          >
            <FileTextIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => setEditMode(false)}
            className={`p-1.5 rounded-md ${
              !editMode
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
            aria-label="Preview mode"
            title="Preview mode"
          >
            <EyeIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="h-[500px] grid grid-cols-1">
        {editMode ? (
          <textarea
            value={markdown}
            onChange={handleChange}
            placeholder={placeholder}
            className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none bg-white dark:bg-gray-900"
            spellCheck="false"
          />
        ) : (
          <div className="w-full h-full p-4 overflow-auto bg-white dark:bg-gray-900">
            <div className="prose dark:prose-invert max-w-none">
              {markdown ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {markdown}
                </ReactMarkdown>
              ) : (
                <div className="text-gray-400 dark:text-gray-600 italic">
                  No content to preview. Start writing in edit mode.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
