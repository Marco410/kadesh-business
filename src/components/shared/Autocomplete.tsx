"use client";

import { useState, useRef, useEffect } from 'react';

export interface AutocompleteOption {
  id: string;
  label: string;
  [key: string]: any;
}

interface AutocompleteProps {
  id: string;
  label: string;
  value: string;
  options: AutocompleteOption[];
  onChange: (value: string) => void;
  onSelect: (option: AutocompleteOption) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: string;
  searchKey?: string; // Key to use for search (default: 'label')
  displayKey?: string; // Key to display (default: 'label')
  className?: string;
}

export default function Autocomplete({
  id,
  label,
  value,
  options,
  onChange,
  onSelect,
  placeholder = 'Buscar...',
  required = false,
  disabled = false,
  loading = false,
  error,
  searchKey = 'label',
  displayKey = 'label',
  className = '',
}: AutocompleteProps) {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Get selected option
  const selectedOption = options.find((opt) => opt.id === value);

  // Filter options based on search
  const filteredOptions = options.filter((option) => {
    const searchValue = option[searchKey]?.toLowerCase() || '';
    return searchValue.includes(search.toLowerCase());
  });

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Update search when value changes externally
  useEffect(() => {
    if (selectedOption) {
      setSearch(selectedOption[displayKey] || '');
    } else if (!value) {
      setSearch('');
    }
  }, [value, selectedOption, displayKey]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value;
    setSearch(newSearch);
    setShowDropdown(true);
    onChange(newSearch);
    
    // Clear selection if search doesn't match selected option
    if (selectedOption && selectedOption[displayKey] !== newSearch) {
      onSelect({ id: '', label: '' } as AutocompleteOption);
    }
  };

  const handleSelect = (option: AutocompleteOption) => {
    setSearch(option[displayKey] || '');
    setShowDropdown(false);
    onSelect(option);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setSearch('');
    setShowDropdown(false);
    onSelect({ id: '', label: '' } as AutocompleteOption);
    inputRef.current?.focus();
  };

  const handleFocus = () => {
    if (!disabled && !loading && options.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleBlur = () => {
    // Delay to allow click on dropdown items
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label htmlFor={id} className="block text-sm font-medium text-[#212121] dark:text-[#ffffff] mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={search}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || loading}
          required={required}
          className={`w-full px-4 py-2 rounded-lg border ${
            error 
              ? 'border-red-500 dark:border-red-500' 
              : 'border-[#e0e0e0] dark:border-[#3a3a3a]'
          } bg-white dark:bg-[#121212] text-[#212121] dark:text-[#ffffff] placeholder:text-[#616161] dark:placeholder:text-[#b0b0b0] focus:outline-none focus:ring-2 focus:ring-orange-500 dark:focus:ring-orange-400 disabled:opacity-50`}
        />
        
        {/* Clear button */}
        {search && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#616161] dark:text-[#b0b0b0] hover:text-[#212121] dark:hover:text-[#ffffff] transition-colors"
            tabIndex={-1}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <svg className="animate-spin h-5 w-5 text-[#616161] dark:text-[#b0b0b0]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
        
        {/* Dropdown */}
        {showDropdown && !disabled && !loading && filteredOptions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#121212] border border-[#e0e0e0] dark:border-[#3a3a3a] rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredOptions.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => handleSelect(option)}
                className={`w-full text-left px-4 py-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors ${
                  value === option.id 
                    ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' 
                    : 'text-[#212121] dark:text-[#ffffff]'
                }`}
              >
                {option[displayKey]}
              </button>
            ))}
          </div>
        )}
        
        {/* No results message */}
        {showDropdown && !disabled && !loading && search && filteredOptions.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-[#121212] border border-[#e0e0e0] dark:border-[#3a3a3a] rounded-lg shadow-lg p-4 text-center text-[#616161] dark:text-[#b0b0b0]">
            No se encontraron resultados que coincidan con "{search}"
          </div>
        )}
      </div>
      
      {/* Error message */}
      {error && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}
      
      {/* Validation message */}
      {required && !value && search && (
        <p className="text-red-500 text-xs mt-2">Selecciona una opción de la lista</p>
      )}
    </div>
  );
}
