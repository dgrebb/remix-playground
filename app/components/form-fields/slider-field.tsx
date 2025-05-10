import { useState, useEffect } from "react";
import { Slider } from "~/components/ui/slider";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { FieldProps } from "./index";

export function SliderField({ field, value, onChange }: FieldProps) {
  const min = field.parameters?.min ?? 0;
  const max = field.parameters?.max ?? 100;
  const step = field.parameters?.step ?? 1;
  const [inputValue, setInputValue] = useState<string>(
    value !== undefined ? value.toString() : min.toString()
  );

  // Update input value when slider value changes
  useEffect(() => {
    setInputValue(value !== undefined ? value.toString() : min.toString());
  }, [value, min]);

  const handleSliderChange = (newValue: number[]) => {
    onChange(field.name, newValue[0]);
    setInputValue(newValue[0].toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
  };

  const handleInputBlur = () => {
    let numValue = parseFloat(inputValue);

    // Validate the input value
    if (isNaN(numValue)) {
      numValue = min;
    } else {
      numValue = Math.max(min, Math.min(max, numValue));
    }

    setInputValue(numValue.toString());
    onChange(field.name, numValue);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        <Label htmlFor={field.name}>{field.label}</Label>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Slider
            id={`${field.name}-slider`}
            min={min}
            max={max}
            step={step}
            value={[value ?? min]}
            onValueChange={handleSliderChange}
            tabIndex={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{min}</span>
            <span>{max}</span>
          </div>
        </div>
        <Input
          id={field.name}
          type="number"
          min={min}
          max={max}
          step={step}
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="w-20"
          tabIndex={0}
        />
      </div>
    </div>
  );
}
