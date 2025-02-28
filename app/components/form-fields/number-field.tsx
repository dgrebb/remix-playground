import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { FieldProps } from "./index";

export function NumberField({ field, value, onChange }: FieldProps) {
  const min = field.parameters?.min;
  const max = field.parameters?.max;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value === "" ? undefined : Number(e.target.value);
    onChange(field.name, newValue);
  };

  return (
    <div className="mb-4">
      <Label htmlFor={field.name}>{field.label}</Label>
      <Input
        id={field.name}
        type="number"
        value={value ?? ""}
        onChange={handleChange}
        min={min}
        max={max}
      />
      {(min !== undefined || max !== undefined) && (
        <p className="text-xs text-muted-foreground mt-1">
          {min !== undefined && max !== undefined
            ? `Value must be between ${min} and ${max}`
            : min !== undefined
            ? `Minimum value: ${min}`
            : `Maximum value: ${max}`}
        </p>
      )}
    </div>
  );
}
