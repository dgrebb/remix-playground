import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { FieldProps } from "./index";

export function SelectField({ field, value, onChange }: FieldProps) {
  return (
    <div className="mb-4">
      <Label htmlFor={field.name}>{field.label}</Label>
      <Select
        value={value || ""}
        onValueChange={(value) => onChange(field.name, value)}
      >
        <SelectTrigger id={field.name}>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
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
