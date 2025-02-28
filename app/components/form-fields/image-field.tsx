import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { FieldProps } from "./index";
import { useFetcher } from "@remix-run/react";
import { useEffect } from "react";

export function ImageField({ field, value, onChange }: FieldProps) {
  const imageFetcher = useFetcher();

  // Handle file selection without using a nested form
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      imageFetcher.submit(formData, {
        method: "post",
        action: "/api/upload",
        encType: "multipart/form-data",
      });
    }
  };

  // Update the form value when the image URL is available
  useEffect(() => {
    if (imageFetcher.data?.fileUrl) {
      onChange(field.name, imageFetcher.data.fileUrl);
    }
  }, [imageFetcher.data, field.name, onChange]);

  return (
    <div className="mb-4">
      <Label htmlFor={field.name}>{field.label}</Label>
      <div className="flex flex-col gap-2">
        <Input
          id={field.name}
          name="file"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {imageFetcher.state === "submitting" && (
          <p className="text-sm text-muted-foreground">Uploading...</p>
        )}
        {imageFetcher.data?.fileUrl && (
          <div>
            <img
              src={imageFetcher.data.fileUrl}
              alt="Uploaded"
              className="mt-2 max-w-full h-auto max-h-40 object-contain"
            />
            <input
              type="hidden"
              name={field.name}
              value={imageFetcher.data.fileUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
}
