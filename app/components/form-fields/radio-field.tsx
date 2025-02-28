import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Label } from "~/components/ui/label";
import { FieldProps } from "./index";

export function RadioField({ field, value, onChange }: FieldProps) {
  return (
    <div className="mb-4">
      <Label>{field.label}</Label>
      <RadioGroup
        value={value || ""}
        onValueChange={(value) => onChange(field.name, value)}
      >
        {field.options?.map((option) => (
          <div className="flex items-center space-x-2" key={option}>
            <RadioGroupItem value={option} id={`${field.name}-${option}`} />
            <Label htmlFor={`${field.name}-${option}`}>{option}</Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
