import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import {
  Box,
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  OutlinedInputProps
} from '@mui/material';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

function isValidHexColor(color: string = '') {
  // 正規表現: #の後に3桁または6桁の16進数が続くパターン
  const hexPattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexPattern.test(color);
}

export const ColorField: React.FC<OutlinedInputProps & { value?: string }> = ({
  value: color,
  onChange: onChangeColor,
  ...others
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [_color, _setColor] = useState(color ?? '');
  const isValid = useMemo(() => isValidHexColor(_color), [_color]);

  const handleChangeColor = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      _setColor(e.target.value);
      onChangeColor?.(e);
    },
    [onChangeColor]
  );

  useEffect(() => {
    if (color !== undefined && color !== _color) {
      _setColor(color);
    }
  }, [_color, color]);

  return (
    <FormControl sx={{ m: 1, width: '25ch' }} variant='outlined'>
      <InputLabel htmlFor='color-picker'>{others.label}</InputLabel>
      <OutlinedInput
        {...others}
        id='color-picker'
        value={color !== undefined ? color : _color}
        endAdornment={
          <InputAdornment position='end'>
            <Box
              sx={{
                display: 'grid',
                placeContent: 'center',
                width: '1.5rem',
                height: '1.5rem',
                borderRadius: '50%',
                backgroundColor: isValid ? _color : 'grey',
                color: 'white',
                cursor: 'pointer'
              }}
              onClick={() => inputRef.current?.click()}
            >
              {!isValid && (
                <QuestionMarkIcon fontSize='small' color='inherit' />
              )}
            </Box>
          </InputAdornment>
        }
        onChange={handleChangeColor}
      />
      <input
        ref={inputRef}
        type='color'
        value={_color}
        style={{
          width: 0,
          height: 0,
          visibility: 'hidden'
        }}
        onChange={handleChangeColor}
      />
    </FormControl>
  );
};
