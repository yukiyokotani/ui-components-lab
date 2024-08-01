import { Box, useTheme } from '@mui/material';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Transition, TransitionStatus } from 'react-transition-group';

const DURATION = 300;

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
  const theme = useTheme();
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

  const [transitionStyles, setTransitionStyles] = useState<Partial<
    Record<TransitionStatus, React.CSSProperties>
  > | null>(null);

  const defaultStyle: React.CSSProperties = useMemo(
    () => ({
      position: 'absolute',
      left: 0,
      height: '32px',
      borderRadius: '4px',
      backgroundColor: theme.palette.primary.main,
      transition: `width ${DURATION}ms ease-out, transform ${DURATION}ms ease-out`
    }),
    [theme.palette.primary.main]
  );

  useLayoutEffect(() => {
    if (prevValue !== value) {
      const prev = findValueElement(prevValue);
      const next = findValueElement(value);

      const calcPrevStyle = calcTransitionStyle(prev);
      const calcNextStyle = calcTransitionStyle(next);

      setPrevValue(value);
      setTransitionStyles({
        exited: {
          transform: `translateX(${toPX(calcPrevStyle?.left ?? 0)})`,
          width: toPX(calcPrevStyle?.width ?? 0)
        },
        entering: {
          transform: `translateX(${toPX(calcNextStyle?.left ?? 0)})`,
          width: toPX(calcNextStyle?.width ?? 0)
        }
      });

      if (prev && next) {
        onMotionStart();
      }
    }
  }, [
    findValueElement,
    onMotionEnd,
    onMotionStart,
    prevValue,
    transitionStyles,
    value
  ]);

  const handleEntered = useCallback(() => {
    setTransitionStyles(null);
    onMotionEnd();
  }, [onMotionEnd]);

  return (
    <Transition
      in={isInTransition && !!transitionStyles}
      nodeRef={optionTransitionRef}
      timeout={{
        enter: DURATION,
        exit: 0
      }}
      onEntered={handleEntered}
      unmountOnExit
    >
      {(state) => (
        <div
          ref={optionTransitionRef}
          style={{
            ...defaultStyle,
            ...transitionStyles?.[state]
          }}
        />
      )}
    </Transition>
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
    <Box
      ref={containerRef}
      sx={(theme) => ({
        height: 'fit-content',
        padding: '4px 2px',
        borderRadius: '6px',
        backgroundColor: theme.palette.action.selected
      })}
    >
      <fieldset
        style={{
          border: 'none',
          margin: 0,
          padding: 0
        }}
      >
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
            <Box
              key={typeof option === 'string' ? option : option.value}
              className='segmented-option'
              sx={(theme) => ({
                display: 'inline-block',
                position: 'relative',
                borderRadius: '4px',
                margin: '0px 2px',
                padding: '4px',
                cursor: 'pointer',
                userSelect: 'none',
                transition: `color ${DURATION}ms ease-in-out`,
                color:
                  optionValue === selectedValue
                    ? theme.palette.primary.contrastText
                    : theme.palette.text.disabled,
                backgroundColor:
                  optionValue === selectedValue && !isInTransition
                    ? theme.palette.primary.main
                    : 'transparent'
              })}
            >
              <label
                style={{
                  cursor: 'pointer'
                }}
              >
                <input
                  type='radio'
                  name={optionLabel}
                  value={optionValue}
                  checked={optionValue === selectedValue}
                  style={{
                    display: 'none'
                  }}
                  onChange={() => {
                    onChange(option);
                    setSelectedValue(optionValue);
                  }}
                />
                <div title={optionLabel}>{optionLabel}</div>
              </label>
            </Box>
          );
        })}
      </fieldset>
    </Box>
  );
};
