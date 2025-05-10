import { useState, useEffect } from "react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { FieldProps } from "./index";

export function DurationField({ field, value, onChange }: FieldProps) {
  const [amount, setAmount] = useState<number>(1);
  const [unit, setUnit] = useState<string>("days");

  // Parse value on initial load
  useEffect(() => {
    if (value) {
      try {
        const parts = value.split(" ");
        if (parts.length === 2) {
          setAmount(Number(parts[0]));
          setUnit(parts[1]);
        }
      } catch (e) {
        console.error("Error parsing duration value:", e);
      }
    }
  }, [value]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = Number(e.target.value);
    setAmount(newAmount);
    updateValue(newAmount, unit);
  };

  const handleUnitChange = (newUnit: string) => {
    setUnit(newUnit);
    updateValue(amount, newUnit);
  };

  const updateValue = (newAmount: number, newUnit: string) => {
    onChange(field.name, `${newAmount} ${newUnit}`);
  };

  return (
    <div className="mb-4">
      <Label htmlFor={field.name}>{field.label}</Label>
      <div className="flex space-x-2 mt-1">
        <Input
          id={field.name}
          type="number"
          min="0"
          value={amount}
          onChange={handleAmountChange}
          className="w-24"
        />
        <Select value={unit} onValueChange={handleUnitChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Unit" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minutes">Minutes</SelectItem>
            <SelectItem value="hours">Hours</SelectItem>
            <SelectItem value="days">Days</SelectItem>
            <SelectItem value="weeks">Weeks</SelectItem>
            <SelectItem value="months">Months</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
