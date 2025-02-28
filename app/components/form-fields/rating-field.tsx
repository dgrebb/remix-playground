import { useState } from "react";
import { Label } from "~/components/ui/label";
import { Star } from "lucide-react";
import { FieldProps } from "./index";

export function RatingField({ field, value, onChange }: FieldProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const scale = field.parameters?.scale || 5;

  const handleClick = (rating: number) => {
    onChange(field.name, rating);
  };

  return (
    <div className="mb-4">
      <Label className="mb-2 block">{field.label}</Label>
      <div className="flex space-x-1">
        {Array.from({ length: scale }, (_, i) => i + 1).map((rating) => (
          <button
            key={rating}
            type="button"
            className="focus:outline-none"
            onClick={() => handleClick(rating)}
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(null)}
          >
            <Star
              className={`h-6 w-6 ${
                (
                  hoveredRating !== null
                    ? rating <= hoveredRating
                    : rating <= (value || 0)
                )
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
      {value && (
        <p className="text-sm text-muted-foreground mt-1">
          Your rating: {value} of {scale}
        </p>
      )}
    </div>
  );
}
