import { useState, useEffect } from "react";
import { FormStructure } from "~/utils/markdown-parser";
import { Button } from "~/components/ui/button";
import { DynamicField } from "~/components/form-fields";
import { useTheme } from "remix-themes";

interface FormRendererProps {
  formStructure: FormStructure;
  onSubmit: (formData: Record<string, any>) => void;
  isPreview?: boolean;
  initialValues?: Record<string, any>;
  onInstructionsChange?: (name: string, instructions: string) => void;
}

export function FormRenderer({
  formStructure,
  onSubmit,
  isPreview = false,
  initialValues = {},
  onInstructionsChange,
}: FormRendererProps) {
  const [formValues, setFormValues] =
    useState<Record<string, any>>(initialValues);
  const [listItems, setListItems] = useState<Record<string, string[]>>({});
  const [theme] = useTheme();

  // Initialize list items from initialValues
  useEffect(() => {
    const initialListItems: Record<string, string[]> = {};

    // Extract list items from initialValues
    Object.entries(initialValues).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        initialListItems[key] = value;
      }
    });

    if (Object.keys(initialListItems).length > 0) {
      setListItems(initialListItems);
    }
  }, [initialValues]);

  // Update form values when initialValues change
  useEffect(() => {
    setFormValues(initialValues);
  }, [initialValues]);

  const handleInputChange = (name: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddListItem = (name: string, value: string) => {
    if (!value.trim()) return;

    setListItems((prev) => {
      const currentItems = prev[name] || [];
      const newItems = [...currentItems, value];

      // Also update the form values with the array of items
      setFormValues((formPrev) => ({
        ...formPrev,
        [name]: newItems,
      }));

      return { ...prev, [name]: newItems };
    });

    // Clear the input after adding
    setFormValues((prev) => ({ ...prev, [`${name}_input`]: "" }));
  };

  const handleRemoveListItem = (name: string, index: number) => {
    setListItems((prev) => {
      const currentItems = [...(prev[name] || [])];
      currentItems.splice(index, 1);

      // Also update the form values with the updated array
      setFormValues((formPrev) => ({
        ...formPrev,
        [name]: currentItems,
      }));

      return { ...prev, [name]: currentItems };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formValues);
  };

  // The content to render inside the form or div
  const formContent = (
    <>
      <h1 className="text-2xl font-bold mb-4">{formStructure.title}</h1>

      {formStructure.sections.map((section, index) => (
        <div
          key={index}
          className={`mb-6 p-4 rounded-lg ${
            theme === "dark"
              ? index % 2 === 0
                ? "bg-slate-800"
                : "bg-slate-750"
              : index % 2 === 0
              ? "bg-slate-100"
              : "bg-slate-50"
          } border border-border`}
        >
          <h2 className="text-xl font-semibold mb-3 pb-2 border-b border-border">
            {section.title}
          </h2>
          <div className="space-y-4">
            {section.fields.map((field) => (
              <DynamicField
                key={field.name}
                field={field}
                value={
                  field.type === "list"
                    ? formValues[`${field.name}_input`]
                    : formValues[field.name]
                }
                onChange={handleInputChange}
                listItems={listItems}
                onAddListItem={handleAddListItem}
                onRemoveListItem={handleRemoveListItem}
                onInstructionsChange={onInstructionsChange}
              />
            ))}
          </div>
        </div>
      ))}

      {!isPreview && (
        <Button type="submit" className="mt-4">
          Submit
        </Button>
      )}
    </>
  );

  // If it's a preview, render in a div instead of a form
  if (isPreview) {
    return <div className="form-preview">{formContent}</div>;
  }

  // Otherwise, render as a real form
  return <form onSubmit={handleSubmit}>{formContent}</form>;
}
