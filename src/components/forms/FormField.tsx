import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  help?: string;
  children?: ReactNode;
}

export const FormField = ({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  error,
  help,
  children,
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="flex items-center gap-1">
        {label}
        {required && <span className="text-red-600">*</span>}
      </Label>
      {children ? (
        children
      ) : (
        <Input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={error ? "border-red-600" : ""}
        />
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      {help && <p className="text-sm text-gray-500">{help}</p>}
    </div>
  );
};