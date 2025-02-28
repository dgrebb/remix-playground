import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { FieldProps } from "./index";
import { FileIcon, X } from "lucide-react";

export function FileField({ field, value, onChange }: FieldProps) {
  const [fileName, setFileName] = useState<string | undefined>(
    value ? value.name : undefined
  );

  const allowedTypes = field.parameters?.allowedTypes;
  const accept = allowedTypes
    ? allowedTypes.map((type) => `.${type}`).join(",")
    : undefined;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onChange(field.name, file);
    }
  };

  const clearFile = () => {
    setFileName(undefined);
    onChange(field.name, undefined);
  };

  return (
    <div className="mb-4">
      <Label htmlFor={field.name}>{field.label}</Label>
      <div className="mt-1">
        {fileName ? (
          <div className="flex items-center p-2 border rounded">
            <FileIcon className="h-4 w-4 mr-2" />
            <span className="flex-1 truncate">{fileName}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFile}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Input
            id={field.name}
            type="file"
            onChange={handleFileChange}
            accept={accept}
          />
        )}
      </div>
      {allowedTypes && (
        <p className="text-xs text-muted-foreground mt-1">
          Allowed file types: {allowedTypes.join(", ")}
        </p>
      )}
    </div>
  );
}
