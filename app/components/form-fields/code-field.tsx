import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { FieldProps } from "./index";

export function CodeField({ field, value, onChange }: FieldProps) {
  const language = field.parameters?.language || "text";

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(field.name, e.target.value);
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-1">
        <Label htmlFor={field.name}>{field.label}</Label>
        <span className="text-xs text-muted-foreground">
          {language.toUpperCase()}
        </span>
      </div>
      <Textarea
        id={field.name}
        value={value || ""}
        onChange={handleChange}
        className="font-mono text-sm h-32"
        placeholder={`Enter ${language} code here...`}
      />
    </div>
  );
}
