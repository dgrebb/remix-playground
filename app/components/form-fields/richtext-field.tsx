import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import { FieldProps } from "./index";
import { Button } from "~/components/ui/button";
import { Bold, Italic, List, ListOrdered } from "lucide-react";

export function RichTextField({ field, value, onChange }: FieldProps) {
  const [text, setText] = useState(value || "");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onChange(field.name, e.target.value);
  };

  const insertMarkup = (markup: string, placeholder?: string) => {
    const textarea = document.getElementById(field.name) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const beforeText = textarea.value.substring(0, start);
    const afterText = textarea.value.substring(end);

    let newText;
    if (selectedText) {
      newText = beforeText + markup.replace("$1", selectedText) + afterText;
    } else if (placeholder) {
      newText = beforeText + markup.replace("$1", placeholder) + afterText;
    } else {
      newText = beforeText + markup + afterText;
    }

    setText(newText);
    onChange(field.name, newText);

    // Focus back on textarea
    setTimeout(() => {
      textarea.focus();
      const newCursorPos =
        start +
        markup.indexOf("$1") +
        (selectedText || placeholder || "").length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  return (
    <div className="mb-4">
      <Label htmlFor={field.name}>{field.label}</Label>
      <div className="border rounded-t p-1 flex space-x-1 bg-muted">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkup("**$1**", "bold text")}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkup("*$1*", "italic text")}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkup("\n- $1\n", "list item")}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertMarkup("\n1. $1\n", "list item")}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        id={field.name}
        value={text}
        onChange={handleChange}
        className="min-h-32 rounded-t-none"
      />
    </div>
  );
}
