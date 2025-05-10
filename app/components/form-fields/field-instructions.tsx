import { useState } from "react";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { ChevronDown, ChevronUp, Lightbulb } from "lucide-react";

interface FieldInstructionsProps {
  instructions: string;
  onChange: (instructions: string) => void;
}

export function FieldInstructions({
  instructions,
  onChange,
}: FieldInstructionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-1 mb-2 text-sm">
      <Button
        variant="ghost"
        size="sm"
        className="p-0 h-auto flex items-center text-muted-foreground hover:text-foreground"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Lightbulb className="h-3.5 w-3.5 mr-1" />
        <span>LLM Instructions</span>
        {isOpen ? (
          <ChevronUp className="h-3.5 w-3.5 ml-1" />
        ) : (
          <ChevronDown className="h-3.5 w-3.5 ml-1" />
        )}
      </Button>

      {isOpen && (
        <div className="mt-2">
          <Textarea
            placeholder="Add specific instructions for how the AI should generate this section..."
            value={instructions || ""}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[80px] text-xs"
          />
          <p className="text-xs text-muted-foreground mt-1">
            These instructions will guide the AI on how to format or approach
            this specific section.
          </p>
        </div>
      )}
    </div>
  );
}
