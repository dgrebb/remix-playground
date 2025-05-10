import { useState } from "react";
import { Button } from "~/components/ui/button";
import { FormField, FormStructure } from "~/utils/markdown-parser";
import { Eye, EyeOff, Copy } from "lucide-react";
import { useTheme } from "remix-themes";

interface PromptPreviewProps {
  fields: FormStructure | FormField[];
  formTitle: string;
  defaultOpen?: boolean;
  hideToggle?: boolean;
  formValues?: Record<string, any>;
}

export function PromptPreview({
  fields,
  formTitle,
  defaultOpen = false,
  hideToggle = false,
  formValues = {},
}: PromptPreviewProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [theme] = useTheme();

  const generatePrompt = () => {
    let prompt = `# ${formTitle}\n\n`;

    // Add context instructions for the LLM
    prompt += `## Context\n`;
    prompt += `This prompt includes default values from user input. When generating content:\n`;
    prompt += `- Use these default values if no specific instructions override them\n`;
    prompt += `- Fall back to these values if you can't find relevant information\n`;
    prompt += `- Use these values when explicitly instructed to use defaults\n\n`;

    // Handle both FormStructure and FormField[] types
    if (fields) {
      if ("sections" in fields) {
        // It's a FormStructure
        fields.sections.forEach((section) => {
          section.fields.forEach((field) => {
            const fieldValue = formValues[field.name];
            const hasValue =
              fieldValue !== undefined &&
              fieldValue !== null &&
              fieldValue !== "";

            if (field.instructions || hasValue) {
              prompt += `## ${field.label}\n`;

              // Add instructions if available
              if (field.instructions) {
                prompt += `${field.instructions}\n`;
              }

              // Add default value if available
              if (hasValue) {
                let valueDisplay = fieldValue;

                // Format arrays nicely
                if (Array.isArray(fieldValue)) {
                  valueDisplay = fieldValue.join(", ");
                }

                // Format objects nicely
                if (
                  typeof fieldValue === "object" &&
                  fieldValue !== null &&
                  !Array.isArray(fieldValue)
                ) {
                  valueDisplay = JSON.stringify(fieldValue, null, 2);
                }

                prompt += `Default value: ${valueDisplay}\n`;
              }

              prompt += "\n";
            }
          });
        });
      } else if (Array.isArray(fields)) {
        // It's an array of FormField
        fields.forEach((field) => {
          const fieldValue = formValues[field.name];
          const hasValue =
            fieldValue !== undefined &&
            fieldValue !== null &&
            fieldValue !== "";

          if (field.instructions || hasValue) {
            prompt += `## ${field.label}\n`;

            // Add instructions if available
            if (field.instructions) {
              prompt += `${field.instructions}\n`;
            }

            // Add default value if available
            if (hasValue) {
              let valueDisplay = fieldValue;

              // Format arrays nicely
              if (Array.isArray(fieldValue)) {
                valueDisplay = fieldValue.join(", ");
              }

              // Format objects nicely
              if (
                typeof fieldValue === "object" &&
                fieldValue !== null &&
                !Array.isArray(fieldValue)
              ) {
                valueDisplay = JSON.stringify(fieldValue, null, 2);
              }

              prompt += `Default value: ${valueDisplay}\n`;
            }

            prompt += "\n";
          }
        });
      }
    }

    return prompt;
  };

  const promptText = generatePrompt();

  return (
    <div>
      {!hideToggle && (
        <div className="p-4 border-b bg-muted/50 flex justify-between items-center">
          <h3 className="font-medium">LLM Prompt Preview</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(promptText)}
              className="text-xs"
            >
              <Copy className="h-3.5 w-3.5 mr-1" />
              Copy
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-xs"
            >
              {isOpen ? (
                <>
                  <EyeOff className="h-3.5 w-3.5 mr-1" />
                  Hide
                </>
              ) : (
                <>
                  <Eye className="h-3.5 w-3.5 mr-1" />
                  Show
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {(isOpen || hideToggle) && (
        <div
          className={`p-4 ${
            theme === "dark" ? "bg-slate-900" : "bg-slate-800"
          } text-slate-50 rounded-b-md overflow-auto max-h-[500px]`}
        >
          <pre className="whitespace-pre-wrap text-sm font-mono">
            {promptText ||
              "No instructions added yet. Add instructions to fields to see the prompt preview."}
          </pre>
        </div>
      )}
    </div>
  );
}
