import React from 'react';
import { LucideIcon } from 'lucide-react';

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
    <div className="space-y-2">
      <div className="relative group">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200">
            <Icon className={`h-5 w-5 transition-colors duration-200 ${
              error 
                ? 'text-red-400 group-focus-within:text-red-600' 
                : 'text-gray-400 group-focus-within:text-primary-600'
            }`} />
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          className={`w-full px-4 py-3.5 border rounded-xl bg-white/50 backdrop-blur-sm transition-all duration-200 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
            Icon ? 'pl-11' : 'pl-4'
          } ${
            error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' 
              : 'border-gray-200 focus:border-primary-500 focus:ring-primary-500/20 hover:border-gray-300'
          }`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        
        {/* Focus effect */}
        <div className={`absolute inset-0 rounded-xl pointer-events-none transition-all duration-200 ${
          error 
            ? 'group-focus-within:ring-2 group-focus-within:ring-red-500/20' 
            : 'group-focus-within:ring-2 group-focus-within:ring-primary-500/20'
        }`}></div>
      </div>
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm font-medium animate-fade-in">
          <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;