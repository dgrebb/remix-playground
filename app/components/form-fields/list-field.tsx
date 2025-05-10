import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";
import { FieldProps } from "./index";
import { useState, useEffect } from "react";

export function ListField({
  field,
  value,
  onChange,
  listItems = {},
  onAddListItem,
  onRemoveListItem,
}: FieldProps) {
  const [inputValue, setInputValue] = useState("");

  // Use local state to track input value
  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  if (!onAddListItem || !onRemoveListItem) {
    console.warn(
      "List field requires onAddListItem and onRemoveListItem props"
    );
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(`${field.name}_input`, newValue);
  };

  const handleAddItem = () => {
    if (!inputValue.trim()) return;

    onAddListItem(field.name, inputValue);
    setInputValue(""); // Clear local state
  };

  return (
    <div className="mb-4">
      <Label htmlFor={`${field.name}_input`}>{field.label}</Label>
      <div className="flex space-x-2">
        <Input
          id={`${field.name}_input`}
          value={inputValue}
          onChange={handleInputChange}
        />
        <Button type="button" onClick={handleAddItem}>
          Add
        </Button>
      </div>

      <div className="mt-2">
        {(listItems[field.name] || []).map((item, index) => (
          <div
            key={`${field.name}-${index}`}
            className="flex items-center justify-between p-2 rounded mt-1"
          >
            <span>{item}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveListItem(field.name, index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
