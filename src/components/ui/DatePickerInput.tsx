"use client";

import { Input } from "./input";
import { Button } from "./button";
import { Calendar, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
};

export function DatePickerInput({ value, onChange, placeholder = "yyyy-mm-dd", className, disabled, required, name, id }: Props) {
  return (
    <div className={cn("relative", className)}>
      <Input
        id={id}
        name={name}
        type="date"
        placeholder={placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className="pr-20"
      />
      {value ? (
        <Button type="button" variant="ghost" size="sm" className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground" onClick={() => onChange("")}
          aria-label="Clear date">
          <X className="h-4 w-4" />
        </Button>
      ) : null}
      <Button type="button" variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
        onClick={(e) => {
          // Focus the input to trigger native picker
          const container = (e.currentTarget.parentElement as HTMLElement) || undefined;
          const input = container?.querySelector('input[type="date"]') as HTMLInputElement | null;
          input?.showPicker?.();
          input?.focus();
        }} aria-label="Open date picker">
        <Calendar className="h-4 w-4" />
      </Button>
    </div>
  );
}

export default DatePickerInput;
