export interface FormField {
  type: FieldType;
  label: string;
  name: string;
  options?: string[];
  parameters?: Record<string, any>;
  defaultValue?: string;
  instructions?: string;
}

export interface FormSection {
  title: string;
  fields: FormField[];
}

export interface FormStructure {
  title: string;
  sections: FormSection[];
}

export type FieldType =
  | "text"
  | "radio"
  | "select"
  | "list"
  | "image"
  | "date"
  | "datetime"
  | "daterange"
  | "number"
  | "richtext"
  | "markdown"
  | "file"
  | "multiselect"
  | "rating"
  | "url"
  | "email"
  | "dependency"
  | "duration"
  | "code"
  | "checkbox"
  | "matrix"
  | "slider";

export function parseMarkdown(markdown: string): FormStructure {
  try {
    const lines = markdown.split("\n").filter((line) => line.trim() !== "");

    let formTitle = "Untitled Form";
    const sections: FormSection[] = [];
    let currentSection: FormSection | null = null;

    for (const line of lines) {
      // Parse form title (# Title)
      if (line.startsWith("# ")) {
        formTitle = line.substring(2).trim();
        continue;
      }

      // Parse section title (## Section)
      if (line.startsWith("## ")) {
        if (currentSection) {
          sections.push(currentSection);
        }

        currentSection = {
          title: line.substring(3).trim(),
          fields: [],
        };
        continue;
      }

      // Parse field definition (name: type)
      if (currentSection && line.includes(":")) {
        const field = parseField(line);
        if (field) {
          currentSection.fields.push(field);
        }
      }
    }

    // Add the last section if it exists
    if (currentSection) {
      sections.push(currentSection);
    }

    return { title: formTitle, sections };
  } catch (error) {
    console.error("Error parsing markdown:", error);
    return {
      title: "Error in Form",
      sections: [
        {
          title: "Error",
          fields: [
            {
              type: "text",
              label: "Error",
              name: "error",
              defaultValue:
                "There was an error parsing the markdown. Please check your syntax.",
            },
          ],
        },
      ],
    };
  }
}

function parseField(line: string): Field | null {
  const match = line.match(/^([^:]+):\s*([^\[]+)(?:\[(.*)\])?$/);
  if (!match) return null;

  const [, label, type, optionsStr] = match;
  const fieldName = label.trim().toLowerCase().replace(/\s+/g, "_");
  const fieldType = type.trim().toLowerCase() as FieldType;

  // Parse options for fields that have them
  let options: string[] = [];
  let parameters: Record<string, any> = {};

  if (optionsStr) {
    // Handle different option formats based on field type
    if (
      ["radio", "select", "multiselect", "dependency", "checkbox"].includes(
        fieldType
      )
    ) {
      options = optionsStr.split(",").map((opt) => opt.trim());
    } else if (fieldType === "number") {
      // Parse min/max parameters: number[min=1,max=100]
      optionsStr.split(",").forEach((param) => {
        const [key, value] = param.trim().split("=");
        if (key && value) {
          parameters[key.trim()] = parseFloat(value.trim());
        }
      });
    } else if (fieldType === "rating") {
      // Rating scale: rating[5] for a 5-star rating
      parameters.scale = parseInt(optionsStr.trim(), 10) || 5;
    } else if (fieldType === "file") {
      // File types: file[pdf,docx,xlsx]
      parameters.allowedTypes = optionsStr.split(",").map((t) => t.trim());
    } else if (fieldType === "code") {
      // Code language: code[javascript]
      parameters.language = optionsStr.trim();
    } else if (fieldType === "matrix") {
      // Matrix format: matrix[rows:A|B|C,columns:X|Y|Z]
      optionsStr.split(",").forEach((dimension) => {
        const [key, values] = dimension.trim().split(":");
        if (key && values) {
          parameters[key.trim()] = values.split("|").map((v) => v.trim());
        }
      });
    } else if (fieldType === "slider") {
      // Slider range: slider[0,100]
      const [min, max] = optionsStr.split(",").map((v) => parseFloat(v.trim()));
      parameters.min = min || 0;
      parameters.max = max || 100;
    }
  }

  return {
    name: fieldName,
    label: label.trim(),
    type: fieldType,
    options,
    parameters,
  };
}
