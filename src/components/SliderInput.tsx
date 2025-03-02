import React, { useState, useEffect, useRef } from 'react';
import { Tooltip } from './Tooltip';

interface SliderInputProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  tooltip?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export const SliderInput: React.FC<SliderInputProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  tooltip,
  formatValue,
  className = '',
}) => {
  const [localValue, setLocalValue] = useState<string>(value.toString());
  const sliderRef = useRef<HTMLInputElement>(null);
  const displayValue = formatValue ? formatValue(value) : value.toString();
  
  // Update local value when prop changes
  useEffect(() => {
    setLocalValue(value.toString());
  }, [value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    // Only update if the value has actually changed
    if (newValue !== value) {
      setLocalValue(newValue.toString());
      onChange(newValue);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  };

  const handleInputBlur = () => {
    let newValue = parseFloat(localValue);
    
    if (isNaN(newValue)) {
      newValue = value;
      setLocalValue(value.toString());
    } else {
      // Ensure value is within bounds
      newValue = Math.max(min, Math.min(max, newValue));
      setLocalValue(newValue.toString());
      
      // Only update if the value has actually changed
      if (newValue !== value) {
        onChange(newValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </label>
            {tooltip && <Tooltip content={tooltip} />}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {displayValue}
          </span>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <input
            ref={sliderRef}
            type="range"
            value={value}
            onChange={handleSliderChange}
            min={min}
            max={max}
            step={step}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            style={{ touchAction: 'none' }}
          />

          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{formatValue ? formatValue(min) : min}</span>
            <span>{formatValue ? formatValue(max) : max}</span>
          </div>
        </div>

        <div className="w-24">
          <input
            type="text"
            value={localValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white text-right"
          />
        </div>
      </div>
    </div>
  );
};