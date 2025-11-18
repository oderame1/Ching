import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onValueChange?: (value: string) => void;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, onValueChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onValueChange?.(e.target.value);
      onChange?.(e);
    };

    return (
      <select
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      >
        {children}
      </select>
    );
  }
);
Select.displayName = 'Select';

const SelectTrigger = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, ...props }, ref) => {
    return <Select ref={ref} className={cn(className)} {...props} />;
  }
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectValue = ({ placeholder = 'Select...' }: { placeholder?: string }) => {
  return <option value="">{placeholder}</option>;
};

const SelectContent = React.forwardRef<HTMLSelectElement, React.HTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => {
    return (
      <select ref={ref} className={cn(className)} {...props}>
        {children}
      </select>
    );
  }
);
SelectContent.displayName = 'SelectContent';

const SelectItem = React.forwardRef<HTMLOptionElement, React.OptionHTMLAttributes<HTMLOptionElement>>(
  ({ className, ...props }, ref) => {
    return <option ref={ref} className={cn(className)} {...props} />;
  }
);
SelectItem.displayName = 'SelectItem';

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };

