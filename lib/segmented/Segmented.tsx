import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import './segmented.css';

type Option = { label: string; value: string | number };

type SegmentedProps<T extends string | Option> = {
  options: T[];
  value: string | number;
  defaultValue?: string | number;
  onChange: (value: T) => void;
};

export const Segmented = <T extends string | Option>({
  options,
  value,
  defaultValue,
  onChange
}: SegmentedProps<T>) => {
  const [selectedValue, setSelectedValue] = useState<
    string | number | undefined
  >(defaultValue);

  useEffect(() => {
    setSelectedValue(value);
  }, [value]);

  return (
    <fieldset>
      {options.map((option) => {
        const optionLabel = typeof option === 'string' ? option : option.label;
        const optionValue = typeof option === 'string' ? option : option.value;

        return (
          <div
            key={typeof option === 'string' ? option : option.value}
            className={clsx({
              'segmented-option': true,
              selected: optionValue === selectedValue
            })}
          >
            <label className='segmented-option-label'>
              <input
                type='radio'
                name={optionLabel}
                value={optionValue}
                checked={optionValue === selectedValue}
                className={'segmented-option-value'}
                onChange={() => {
                  onChange(option);
                  setSelectedValue(optionValue);
                }}
              />
              <div title={optionLabel}>{optionLabel}</div>
            </label>
          </div>
        );
      })}
    </fieldset>
  );
};
