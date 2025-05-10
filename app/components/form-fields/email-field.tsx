import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { FieldProps } from "./index";
import { useState } from "react";

export function EmailField({ field, value, onChange }: FieldProps) {
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(field.name, newValue);

    if (newValue && !validateEmail(newValue)) {
      setError("Please enter a valid email address");
    } else {
      setError(null);
    }
  };

  return (
    <div className="mb-4">
      <Label htmlFor={field.name}>{field.label}</Label>
      <Input
        id={field.name}
        type="email"
        value={value || ""}
        onChange={handleChange}
        className={error ? "border-red-500" : ""}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
