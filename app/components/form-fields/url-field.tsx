import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { FieldProps } from "./index";
import { useState } from "react";

export function URLField({ field, value, onChange }: FieldProps) {
  const [error, setError] = useState<string | null>(null);

  const validateURL = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(field.name, newValue);

    if (newValue && !validateURL(newValue)) {
      setError("Please enter a valid URL");
    } else {
      setError(null);
    }
  };

  return (
    <div className="mb-4">
      <Label htmlFor={field.name}>{field.label}</Label>
      <Input
        id={field.name}
        type="url"
        value={value || ""}
        onChange={handleChange}
        className={error ? "border-red-500" : ""}
        placeholder="https://example.com"
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
