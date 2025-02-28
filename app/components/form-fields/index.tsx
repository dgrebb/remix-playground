import { TextField } from "./text-field";
import { RadioField } from "./radio-field";
import { SelectField } from "./select-field";
import { ListField } from "./list-field";
import { ImageField } from "./image-field";
import { DateField } from "./date-field";
import { NumberField } from "./number-field";
import { FileField } from "./file-field";
import { MultiSelectField } from "./multi-select-field";
import { RatingField } from "./rating-field";
import { CheckboxField } from "./checkbox-field";
import { SliderField } from "./slider-field";
import { EmailField } from "./email-field";
import { URLField } from "./url-field";
import { DurationField } from "./duration-field";
import { CodeField } from "./code-field";
import { MatrixField } from "./matrix-field";
import { DependencyField } from "./dependency-field";
import { RichTextField } from "./richtext-field";
import { FieldInstructions } from "./field-instructions";
import { FormField } from "~/utils/markdown-parser";

// Create a mapping of field types to components
const fieldComponents = {
  text: TextField,
  radio: RadioField,
  select: SelectField,
  list: ListField,
  image: ImageField,
  date: DateField,
  datetime: DateField,
  daterange: DateField,
  number: NumberField,
  file: FileField,
  multiselect: MultiSelectField,
  rating: RatingField,
  checkbox: CheckboxField,
  slider: SliderField,
};

// Props that all field components will receive
export interface FieldProps {
  field: FormField;
  value?: any;
  onChange: (name: string, value: any) => void;
  onInstructionsChange?: (name: string, instructions: string) => void;
  listItems?: Record<string, string[]>;
  onAddListItem?: (name: string, value: string) => void;
  onRemoveListItem?: (name: string, index: number) => void;
}

// Dynamic field component that renders the appropriate field based on type
export function DynamicField(props: FieldProps) {
  const { field, onInstructionsChange } = props;

  const handleInstructionsChange = (instructions: string) => {
    if (onInstructionsChange) {
      onInstructionsChange(field.name, instructions);
    }
  };

  // Render the field component based on type
  const renderFieldComponent = () => {
    switch (field.type) {
      case "text":
        return <TextField {...props} />;
      case "radio":
        return <RadioField {...props} />;
      case "select":
        return <SelectField {...props} />;
      case "list":
        return <ListField {...props} />;
      case "image":
        return <ImageField {...props} />;
      case "date":
        return <DateField {...props} />;
      case "datetime":
        return <DateField {...props} showTime />;
      case "daterange":
        return <DateField {...props} isRange />;
      case "number":
        return <NumberField {...props} />;
      case "file":
        return <FileField {...props} />;
      case "multiselect":
        return <MultiSelectField {...props} />;
      case "rating":
        return <RatingField {...props} />;
      case "checkbox":
        return <CheckboxField {...props} />;
      case "slider":
        return <SliderField {...props} />;
      case "email":
        return <EmailField {...props} />;
      case "url":
        return <URLField {...props} />;
      case "duration":
        return <DurationField {...props} />;
      case "code":
        return <CodeField {...props} />;
      case "matrix":
        return <MatrixField {...props} />;
      case "dependency":
        return <DependencyField {...props} />;
      case "richtext":
      case "markdown":
        return <RichTextField {...props} />;
      default:
        return (
          <div className="p-2 border border-yellow-500 bg-yellow-50 text-yellow-800 rounded">
            Field type "{field.type}" not implemented yet
          </div>
        );
    }
  };

  return (
    <div className="field-wrapper">
      {renderFieldComponent()}
      {onInstructionsChange && (
        <FieldInstructions
          instructions={field.instructions || ""}
          onChange={handleInstructionsChange}
        />
      )}
    </div>
  );
}

export {
  TextField,
  RadioField,
  SelectField,
  ListField,
  ImageField,
  DateField,
  NumberField,
  FileField,
  MultiSelectField,
  RatingField,
  CheckboxField,
  SliderField,
  EmailField,
  URLField,
  DurationField,
  CodeField,
  MatrixField,
  DependencyField,
  RichTextField,
};
