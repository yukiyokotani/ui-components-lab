import { clsx } from 'clsx';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  transitionShow: boolean;
  value: SegmentedValue;
  getValueIndex: (value: SegmentedValue) => number;
  onMotionStart: VoidFunction;
  onMotionEnd: VoidFunction;
};

const OptionTransition: React.FC<OptionTransitionProps> = ({
  containerRef,
  transitionShow,
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

      return ele?.offsetParent && ele;
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
      } else {
        onMotionEnd();
      }
    }
  }, [findValueElement, onMotionEnd, onMotionStart, prevValue, value]);

  const transitionStart = useMemo(
    () => toPX(prevStyle?.left as number),
    [prevStyle]
  );

  const transitionActive = useMemo(
    () => toPX(nextStyle?.left as number),
    [nextStyle]
  );

  const handleEntered = useCallback(() => {
    setPrevStyle(null);
    setNextStyle(null);
    onMotionEnd();
  }, [onMotionEnd]);

  return (
    <CSSTransition
      in={transitionShow && !!prevStyle && !!nextStyle}
      nodeRef={optionTransitionRef}
      timeout={1000}
      classNames='segmented-transition'
      onEntered={handleEntered}
      unmountOnExit
    >
      <div
        ref={optionTransitionRef}
        className='segmented-option-in-transition'
        style={
          {
            '--transition-start-left': transitionStart,
            '--transition-start-width': toPX(prevStyle?.width ?? 0),
            '--transition-active-left': transitionActive,
            '--transition-active-width': toPX(nextStyle?.width ?? 0)
          } as React.CSSProperties
        }
      ></div>
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

  const [transitionShow, setTransitionShow] = useState(false);

  const [selectedValue, setSelectedValue] = useState<SegmentedValue>(value);

  return (
    <div ref={containerRef} className='segmented-group'>
      <fieldset>
        <OptionTransition
          containerRef={containerRef}
          transitionShow={transitionShow}
          value={selectedValue}
          getValueIndex={(value) =>
            segmentedOptions.findIndex(
              (option) => getOptionValue(option) === value
            )
          }
          onMotionStart={() => {
            setTransitionShow(true);
          }}
          onMotionEnd={() => {
            setTransitionShow(false);
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
                selected: optionValue === selectedValue && !transitionShow
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
