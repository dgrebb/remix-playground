import { useState, useEffect } from "react";
import { Label } from "~/components/ui/label";
import { Checkbox } from "~/components/ui/checkbox";
import { FieldProps } from "./index";

export function MultiSelectField({ field, value, onChange }: FieldProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(value || []);

  useEffect(() => {
    if (value) {
      setSelectedValues(value);
    }
  }, [value]);

  const handleCheckboxChange = (optionValue: string, checked: boolean) => {
    const newValues = checked
      ? [...selectedValues, optionValue]
      : selectedValues.filter((v) => v !== optionValue);

    setSelectedValues(newValues);
    onChange(field.name, newValues);
  };

  return (
    <div className="mb-4">
      <Label className="mb-2 block">{field.label}</Label>
      <div className="space-y-2">
        {field.options?.map((option) => (
          <div key={option} className="flex items-center space-x-2">
            <Checkbox
              id={`${field.name}-${option}`}
              checked={selectedValues.includes(option)}
              onCheckedChange={(checked) =>
                handleCheckboxChange(option, checked === true)
              }
            />
            <Label
              htmlFor={`${field.name}-${option}`}
              className="cursor-pointer"
            >
              {option}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
}
