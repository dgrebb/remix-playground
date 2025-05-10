import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { FieldProps } from "./index";

export function TextField({ field, value, onChange }: FieldProps) {
  return (
    <div className="mb-4">
      <Label htmlFor={field.name}>{field.label}</Label>
      <Input
        id={field.name}
        name={field.name}
        value={value || ""}
        onChange={(e) => onChange(field.name, e.target.value)}
      />
    </div>
  );
}
