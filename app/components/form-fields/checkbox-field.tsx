import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { FieldProps } from "./index";

export function CheckboxField({ field, value, onChange }: FieldProps) {
  const handleChange = (checked: boolean | "indeterminate") => {
    onChange(field.name, checked === true);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id={field.name}
          checked={value === true}
          onCheckedChange={handleChange}
        />
        <Label htmlFor={field.name}>{field.label}</Label>
      </div>
    </div>
  );
}
