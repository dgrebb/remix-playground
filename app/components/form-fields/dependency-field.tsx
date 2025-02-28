import { useState } from "react";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { FieldProps } from "./index";

export function DependencyField({ field, value, onChange }: FieldProps) {
  const handleChange = (newValue: string) => {
    onChange(field.name, newValue);
  };

  return (
    <div className="mb-4">
      <Label htmlFor={field.name}>{field.label}</Label>
      <Select value={value || ""} onValueChange={handleChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a dependency" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">None</SelectItem>
          {field.options?.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
