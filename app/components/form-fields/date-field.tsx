import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Label } from "~/components/ui/label";
import { FieldProps } from "./index";

export function DateField({
  field,
  value,
  onChange,
  showTime = false,
  isRange = false,
}: FieldProps & { showTime?: boolean; isRange?: boolean }) {
  const [date, setDate] = useState<Date | undefined>(
    value ? new Date(value) : undefined
  );

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    onChange(field.name, selectedDate ? selectedDate.toISOString() : undefined);
  };

  return (
    <div className="mb-4">
      <Label htmlFor={field.name}>{field.label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id={field.name}
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "PPP") : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
