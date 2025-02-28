import { useState, useEffect } from "react";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { FieldProps } from "./index";

export function MatrixField({ field, value, onChange }: FieldProps) {
  const rows = field.parameters?.rows || [];
  const columns = field.parameters?.columns || [];
  const [selections, setSelections] = useState<Record<string, string>>(
    value || {}
  );

  useEffect(() => {
    if (value) {
      setSelections(value);
    }
  }, [value]);

  const handleSelect = (row: string, column: string) => {
    const newSelections = { ...selections, [row]: column };
    setSelections(newSelections);
    onChange(field.name, newSelections);
  };

  return (
    <div className="mb-4">
      <Label className="mb-2 block">{field.label}</Label>
      <div className="border rounded overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-muted">
              <th className="p-2 border-b text-left"></th>
              {columns.map((column) => (
                <th key={column} className="p-2 border-b text-center">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row} className="border-b last:border-b-0">
                <td className="p-2 font-medium">{row}</td>
                {columns.map((column) => (
                  <td key={`${row}-${column}`} className="p-2 text-center">
                    <RadioGroup
                      value={selections[row] || ""}
                      onValueChange={(value) => handleSelect(row, value)}
                      className="flex justify-center"
                    >
                      <RadioGroupItem
                        value={column}
                        id={`${field.name}-${row}-${column}`}
                      />
                    </RadioGroup>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
