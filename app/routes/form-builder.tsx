import { useState, useEffect, useRef, useMemo } from "react";
import {
  json,
  redirect,
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
  Link,
  useSubmit,
} from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Switch } from "~/components/ui/switch";
import { Label } from "~/components/ui/label";
import { parseMarkdown } from "~/utils/markdown-parser";
import { FormRenderer } from "~/components/form-renderer";
import { getSession, commitSession } from "~/utils/session.server";
import {
  PencilIcon,
  EyeIcon,
  SaveIcon,
  DownloadIcon,
  UploadIcon,
  FileTextIcon,
  ChevronDown,
  ChevronUp,
  BookOpenIcon,
  HelpCircleIcon,
} from "lucide-react";
import { useDebounce } from "~/hooks/use-debounce";
import { saveAs } from "file-saver";
import { Textarea } from "~/components/ui/textarea";
import { PromptPreview } from "~/components/prompt-preview";
import { useTheme } from "remix-themes";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { CustomPopover } from "~/components/custom-popover";

// Local storage key for auto-save
const LOCAL_STORAGE_KEY = "form-builder-markdown";
const FORM_DATA_KEY = "form-builder-data";

export async function loader({ request }: LoaderFunctionArgs) {
  const session = await getSession(request.headers.get("Cookie"));
  const savedMarkdown =
    session.get("savedMarkdown") ||
    "# My Form\n\n## Personal Information\nName: text\nGender: radio[Male, Female, Other]\nCountry: select[USA, Canada, UK, Australia]\n\n## Interests\nHobbies: list\nProfile Picture: image";

  return json({
    initialMarkdown: savedMarkdown,
    savedFormData: session.get("savedFormData") || {},
  });
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "save_markdown") {
    const markdown = formData.get("markdown") as string;

    // Save the markdown to the session
    const session = await getSession(request.headers.get("Cookie"));
    session.set("savedMarkdown", markdown);

    return json(
      { success: true, markdown },
      { headers: { "Set-Cookie": await commitSession(session) } }
    );
  }

  if (intent === "save_form_data") {
    const formDataJson = formData.get("formData") as string;
    const parsedFormData = JSON.parse(formDataJson);

    // Save the form data to the session
    const session = await getSession(request.headers.get("Cookie"));
    session.set("savedFormData", parsedFormData);

    return json(
      { success: true, formData: parsedFormData },
      { headers: { "Set-Cookie": await commitSession(session) } }
    );
  }

  if (intent === "download_markdown") {
    const markdown = formData.get("markdown") as string;
    const fileName = (formData.get("fileName") as string) || "form-config.md";

    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  }

  return json({ success: false });
}

export default function FormBuilder() {
  const { initialMarkdown, savedFormData } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [theme] = useTheme();

  // State for markdown and edit mode
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [editMode, setEditMode] = useState(true);
  const [formValues, setFormValues] = useState<Record<string, any>>(
    savedFormData || {}
  );
  const [fieldInstructions, setFieldInstructions] = useState<
    Record<string, string>
  >({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    "idle" | "saving" | "saved"
  >("idle");

  // Debounce markdown changes to avoid too many saves
  const debouncedMarkdown = useDebounce(markdown, 1000);

  // Parse the markdown to get the form structure
  const baseFormStructure = parseMarkdown(markdown);

  // Apply instructions to the form structure
  const formStructure = useMemo(() => {
    // Create a deep copy of the form structure
    const enhancedFormStructure = JSON.parse(JSON.stringify(baseFormStructure));

    // Apply instructions to each field
    enhancedFormStructure.sections.forEach((section) => {
      section.fields.forEach((field) => {
        if (fieldInstructions[field.name]) {
          field.instructions = fieldInstructions[field.name];
        }
      });
    });

    return enhancedFormStructure;
  }, [baseFormStructure, fieldInstructions]);

  const isSubmitting = navigation.state === "submitting";

  // Load from localStorage on initial render
  useEffect(() => {
    const savedMarkdown = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedMarkdown && savedMarkdown !== initialMarkdown) {
      // If localStorage has newer content than the server, use it
      setMarkdown(savedMarkdown);
    }

    // Load saved form data from localStorage
    const savedFormData = localStorage.getItem(FORM_DATA_KEY);
    if (savedFormData) {
      try {
        setFormValues(JSON.parse(savedFormData));
      } catch (e) {
        console.error("Error parsing saved form data:", e);
      }
    }
  }, [initialMarkdown]);

  // Save to localStorage whenever markdown changes
  useEffect(() => {
    if (debouncedMarkdown) {
      localStorage.setItem(LOCAL_STORAGE_KEY, debouncedMarkdown);
      setAutoSaveStatus("saving");

      // Auto-save to server after debounce
      const formData = new FormData();
      formData.append("intent", "save_markdown");
      formData.append("markdown", debouncedMarkdown);

      // Use fetch instead of submit to avoid navigation state changes
      fetch("/form-builder", {
        method: "POST",
        body: formData,
      }).then(() => {
        setAutoSaveStatus("saved");
        setTimeout(() => setAutoSaveStatus("idle"), 2000);
      });
    }
  }, [debouncedMarkdown]);

  // Handle manual save
  const handleSave = () => {
    const formData = new FormData();
    formData.append("intent", "save_markdown");
    formData.append("markdown", markdown);
    submit(formData, { method: "post" });
  };

  // Handle export markdown to file
  const handleExport = () => {
    // Create a blob with the markdown content
    const blob = new Blob([markdown], { type: "text/markdown" });

    // Extract form title for filename or use default
    const titleMatch = markdown.match(/^# (.+)$/m);
    const fileName = titleMatch
      ? `${titleMatch[1].replace(/[^a-z0-9]/gi, "-").toLowerCase()}.md`
      : "form-config.md";

    // Use the download attribute to force download
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;

    // Append to body, click, and clean up
    document.body.appendChild(a);
    a.click();

    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Handle export form data to file
  const handleExportFormData = async () => {
    try {
      // Format the form data as JSON
      const formDataJson = JSON.stringify(formValues, null, 2);

      // Extract form title for filename or use default
      const titleMatch = markdown.match(/^# (.+)$/m);
      const suggestedName = titleMatch
        ? `${titleMatch[1].replace(/[^a-z0-9]/gi, "-").toLowerCase()}-data.json`
        : "form-data.json";

      // Check if the File System Access API is available
      if ("showSaveFilePicker" in window) {
        try {
          // Show the file save dialog
          const fileHandle = await (window as any).showSaveFilePicker({
            suggestedName,
            types: [
              {
                description: "JSON Files",
                accept: {
                  "application/json": [".json"],
                },
              },
            ],
          });

          // Create a writable stream and write the content
          const writable = await fileHandle.createWritable();
          await writable.write(
            new Blob([formDataJson], { type: "application/json" })
          );
          await writable.close();

          // Show success message
          setAutoSaveStatus("saved");
          setTimeout(() => setAutoSaveStatus("idle"), 2000);
        } catch (err) {
          // User cancelled or API error
          if (!(err instanceof DOMException && err.name === "AbortError")) {
            console.error("Error saving form data:", err);
            // Fall back to download method if there's an error
            if (
              confirm(
                "Your browser had trouble with the save dialog. Download the file directly instead?"
              )
            ) {
              downloadFile(suggestedName, formDataJson);
            }
          }
        }
      } else {
        // Fall back to download method for browsers without File System Access API
        alert(
          "Your browser doesn't support the File Save dialog. The file will be downloaded directly to your downloads folder."
        );
        downloadFile(suggestedName, formDataJson);
      }
    } catch (error) {
      console.error("Error in export form data:", error);
      alert("There was an error exporting your form data. Please try again.");
    }
  };

  // Helper function for fallback download method
  const downloadFile = (fileName: string, content: string) => {
    const mimeType = fileName.endsWith(".json")
      ? "application/json"
      : "text/markdown";
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  // Trigger file input click
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle import markdown from file
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const isMarkdown =
      file.type === "text/markdown" ||
      file.name.endsWith(".md") ||
      file.name.endsWith(".markdown");

    if (!isMarkdown) {
      alert("Please select a markdown file (.md or .markdown)");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        // Basic validation of markdown content
        if (!content.trim().startsWith("#")) {
          if (
            !confirm(
              "This file doesn't appear to be a valid form markdown. Import anyway?"
            )
          ) {
            return;
          }
        }

        setMarkdown(content);

        // Also save to server
        const formData = new FormData();
        formData.append("intent", "save_markdown");
        formData.append("markdown", content);
        submit(formData, { method: "post" });
      }
    };
    reader.readAsText(file);

    // Reset file input
    e.target.value = "";
  };

  const handleFormSubmit = (formData: Record<string, any>) => {
    // Update local state
    setFormValues(formData);

    // Save to localStorage
    localStorage.setItem(FORM_DATA_KEY, JSON.stringify(formData));

    // Create a form and submit it programmatically
    const form = new FormData();
    form.append("intent", "save_form_data");
    form.append("formData", JSON.stringify(formData));

    // Use fetch to submit the form
    fetch("/form-builder", {
      method: "POST",
      body: form,
    });
  };

  const handleInstructionsChange = (name: string, instructions: string) => {
    setFieldInstructions((prev) => ({
      ...prev,
      [name]: instructions,
    }));
  };

  // Load saved instructions from localStorage on initial render
  useEffect(() => {
    try {
      const savedInstructions = localStorage.getItem("form-instructions");
      if (savedInstructions) {
        setFieldInstructions(JSON.parse(savedInstructions));
      }
    } catch (e) {
      console.error("Error loading saved instructions:", e);
    }
  }, []);

  // Add state for syntax guide accordion
  const [isSyntaxGuideOpen, setSyntaxGuideOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Form Builder</h1>
        <div className="flex items-center space-x-4">
          {/* Edit mode toggle */}
          <div className="flex items-center space-x-2">
            <Label htmlFor="edit-mode" className="cursor-pointer">
              {editMode ? (
                <PencilIcon className="h-5 w-5 text-primary" />
              ) : (
                <EyeIcon className="h-5 w-5 text-primary" />
              )}
            </Label>
            <Switch
              id="edit-mode"
              checked={editMode}
              onCheckedChange={setEditMode}
            />
            <span className="text-sm font-medium">
              {editMode ? "Edit Mode" : "Preview Mode"}
            </span>
          </div>

          {/* Save button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            className="flex items-center gap-1"
            disabled={navigation.state === "submitting"}
          >
            <SaveIcon className="h-4 w-4" />
            Save
          </Button>

          {/* Download button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-1"
          >
            <DownloadIcon className="h-4 w-4" />
            Download
          </Button>

          {/* Upload button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1"
          >
            <UploadIcon className="h-4 w-4" />
            Upload
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".md"
              onChange={handleImport}
            />
          </Button>
        </div>
      </div>

      {/* Always use grid layout, but change content based on edit mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left panel: Markdown editor in edit mode, Prompt preview in view mode */}
        <div
          className={`${
            theme === "dark" ? "bg-slate-800" : "bg-slate-50"
          } p-4 rounded-lg shadow-sm border border-border`}
        >
          {editMode ? (
            // Markdown Editor (edit mode)
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">Markdown Editor</h2>

                {/* Syntax Guide Custom Popover */}
                <CustomPopover
                  trigger={
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full h-6 w-6 p-0 bg-indigo-500 hover:bg-indigo-600 border-indigo-400 text-white"
                    >
                      <HelpCircleIcon className="h-3 w-3" />
                      <span className="sr-only">Syntax Guide</span>
                    </Button>
                  }
                  content={
                    <div className="space-y-2">
                      <h3 className="font-medium text-sm">Syntax Guide</h3>
                      <ul className="text-xs space-y-1.5">
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">
                            # Form Title
                          </code>{" "}
                          - Sets the form title
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">
                            ## Section Name
                          </code>{" "}
                          - Creates a new section
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">
                            Field Label: text
                          </code>{" "}
                          - Creates a text input field
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">
                            Field Label: radio[Option 1, Option 2]
                          </code>{" "}
                          - Creates radio buttons
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">
                            Field Label: select[Option 1, Option 2]
                          </code>{" "}
                          - Creates a dropdown
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">
                            Field Label: list
                          </code>{" "}
                          - Creates a list with add/remove
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">
                            Field Label: image
                          </code>{" "}
                          - Creates an image upload field
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">
                            Field Label: date
                          </code>{" "}
                          - Creates a date picker
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">
                            Field Label: number[min=1,max=100]
                          </code>{" "}
                          - Creates a number input with range
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">
                            Field Label: slider[0,100]
                          </code>{" "}
                          - Creates a slider
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">
                            Field Label: multiselect[Option 1, Option 2]
                          </code>{" "}
                          - Creates checkboxes
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">
                            Field Label: email
                          </code>{" "}
                          - Creates an email input with validation
                        </li>
                        <li>
                          <code className="bg-muted px-1 py-0.5 rounded">
                            Field Label: file[pdf,docx]
                          </code>{" "}
                          - Creates a file upload with type filtering
                        </li>
                      </ul>
                    </div>
                  }
                  hoverDelay={1500}
                  hideDelay={1500}
                  side="right"
                  align="start"
                  sideOffset={20}
                  alignOffset={-50}
                />
              </div>

              <Textarea
                name="markdown"
                className={`w-full h-96 p-2 border font-mono ${
                  theme === "dark"
                    ? "bg-slate-900 text-slate-100"
                    : "bg-white text-slate-800"
                }`}
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
              />
            </div>
          ) : (
            // Prompt Preview (view mode)
            <div>
              <h2 className="text-xl font-semibold mb-2">LLM Prompt</h2>
              <div
                className={`${
                  theme === "dark" ? "bg-slate-700" : "bg-white"
                } border rounded-lg p-4 min-h-96 overflow-auto shadow-sm`}
              >
                <PromptPreview
                  fields={formStructure}
                  formTitle={formStructure.title || "Requirements Document"}
                  defaultOpen={true}
                  hideToggle={true}
                  formValues={formValues}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right panel: Form preview/renderer */}
        <div>
          <div
            className={`${
              theme === "dark" ? "bg-slate-800" : "bg-slate-50"
            } p-4 rounded-lg shadow-sm border border-border`}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">
                {editMode ? "Form Preview" : formStructure.title}
              </h2>

              {/* Export Form Data button */}
              {!editMode && Object.keys(formValues).length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleExportFormData}
                  className="flex items-center gap-1"
                >
                  <FileTextIcon className="h-4 w-4" />
                  Save Responses
                </Button>
              )}
            </div>

            <div
              className={`${
                theme === "dark" ? "bg-slate-700" : "bg-white"
              } border rounded-lg p-4 ${
                editMode ? "min-h-96" : ""
              } overflow-auto shadow-sm`}
            >
              <FormRenderer
                formStructure={formStructure}
                onSubmit={handleFormSubmit}
                isPreview={editMode}
                initialValues={formValues}
                onInstructionsChange={handleInstructionsChange}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Success message */}
      {actionData?.success && (
        <div className="mt-4 p-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded">
          Form saved successfully!
        </div>
      )}

      {/* Prompt preview at bottom - only show in edit mode */}
      {editMode && (
        <div
          className={`${
            theme === "dark" ? "bg-slate-800" : "bg-slate-50"
          } rounded-lg shadow-sm border border-border`}
        >
          <PromptPreview
            fields={formStructure}
            formTitle={formStructure.title || "Requirements Document"}
            formValues={formValues}
          />
        </div>
      )}
    </div>
  );
}

export function ErrorBoundary() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-red-600">Error</h1>
      <p>Something went wrong while rendering the form builder.</p>
      <p>Please check your markdown syntax and try again.</p>
      <Link to="/form-builder" className="mt-4 inline-block">
        <Button>Try Again</Button>
      </Link>
    </div>
  );
}
