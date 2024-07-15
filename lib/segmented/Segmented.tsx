import { clsx } from 'clsx';
import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { CSSTransition } from 'react-transition-group';

import './segmented.css';

type SegmentedValue = string | number;

type TransitionStyle = {
  left: number;
  width: number;
} | null;

type Option = { label: string; value: SegmentedValue };

const calcTransitionStyle = (
  targetElement: HTMLElement | null | undefined
): TransitionStyle => {
  return targetElement
    ? {
        left: targetElement.offsetLeft,
        width: targetElement.clientWidth
      }
    : null;
};

const toPX = (value: number) =>
  value !== undefined ? `${value}px` : undefined;

type OptionTransitionProps = {
  containerRef: React.RefObject<HTMLDivElement>;
  isInTransition: boolean;
  value: SegmentedValue;
  getValueIndex: (value: SegmentedValue) => number;
  onMotionStart: VoidFunction;
  onMotionEnd: VoidFunction;
};

const OptionTransition: React.FC<OptionTransitionProps> = ({
  containerRef,
  isInTransition,
  value,
  getValueIndex,
  onMotionStart,
  onMotionEnd
}) => {
  const optionTransitionRef = useRef<HTMLDivElement>(null);

  const [prevValue, setPrevValue] = useState<SegmentedValue>(value);

  const findValueElement = useCallback(
    (val: SegmentedValue) => {
      const index = getValueIndex(val);
      const ele =
        containerRef.current?.querySelectorAll<HTMLDivElement>(
          '.segmented-option'
        )[index];

      return ele;
    },
    [containerRef, getValueIndex]
  );

  const [prevStyle, setPrevStyle] = useState<TransitionStyle>(null);
  const [nextStyle, setNextStyle] = useState<TransitionStyle>(null);

  useLayoutEffect(() => {
    if (prevValue !== value) {
      const prev = findValueElement(prevValue);
      const next = findValueElement(value);

      const calcPrevStyle = calcTransitionStyle(prev);
      const calcNextStyle = calcTransitionStyle(next);

      setPrevValue(value);
      setPrevStyle(calcPrevStyle);
      setNextStyle(calcNextStyle);

      if (prev && next) {
        onMotionStart();
      }
    }
  }, [findValueElement, onMotionEnd, onMotionStart, prevValue, value]);

  const handleEntered = useCallback(() => {
    setPrevStyle(null);
    setNextStyle(null);
    onMotionEnd();
  }, [onMotionEnd]);

  return (
    <CSSTransition
      in={isInTransition && !!prevStyle && !!nextStyle}
      nodeRef={optionTransitionRef}
      timeout={300}
      classNames='segmented-transition'
      onEntered={handleEntered}
      unmountOnExit
    >
      <div
        ref={optionTransitionRef}
        className='segmented-option-in-transition'
        style={
          {
            '--transition-start-left': toPX(prevStyle?.left ?? 0),
            '--transition-start-width': toPX(prevStyle?.width ?? 0),
            '--transition-active-left': toPX(nextStyle?.left ?? 0),
            '--transition-active-width': toPX(nextStyle?.width ?? 0)
          } as React.CSSProperties
        }
      />
    </CSSTransition>
  );
};

const getOptionLabel = (option: string | Option) =>
  typeof option === 'string' ? option : option.label;

const getOptionValue = (option: string | Option) =>
  typeof option === 'string' ? option : option.value;

type SegmentedProps<T extends string | Option> = {
  segmentedOptions: T[];
  value: SegmentedValue;
  onChange: (value: T) => void;
};

export const Segmented = <T extends string | Option>({
  segmentedOptions,
  value,
  onChange
}: SegmentedProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const [isInTransition, setIsInTransition] = useState(false);

  const [selectedValue, setSelectedValue] = useState<SegmentedValue>(value);

  return (
    <div ref={containerRef} className='segmented-group'>
      <fieldset>
        <OptionTransition
          containerRef={containerRef}
          isInTransition={isInTransition}
          value={selectedValue}
          getValueIndex={(value) =>
            segmentedOptions.findIndex(
              (option) => getOptionValue(option) === value
            )
          }
          onMotionStart={() => {
            setIsInTransition(true);
          }}
          onMotionEnd={() => {
            setIsInTransition(false);
          }}
        />
        {segmentedOptions.map((option) => {
          const optionLabel = getOptionLabel(option);
          const optionValue = getOptionValue(option);
          return (
            <div
              key={typeof option === 'string' ? option : option.value}
              className={clsx({
                'segmented-option': true,
                selected: optionValue === selectedValue && !isInTransition
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
    </div>
  );
};
