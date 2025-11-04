import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface FormInputProps {
  id: string;
  name: string;
  type: string;
  autoComplete?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon?: LucideIcon;
  error?: string;
}

const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type,
  autoComplete,
  placeholder,
  value,
  onChange,
  required = false,
  icon: Icon,
  error
}) => {
  return (
    <div className="space-y-1">
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="h-5 w-5 text-gray-400" />
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          className={`input-field ${Icon ? 'pl-10' : 'pl-4'} ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
      {error && (
        <p className="text-red-600 text-xs font-medium animate-fade-in">{error}</p>
      )}
    </div>
  );
};

export default FormInput;