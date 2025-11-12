const types = {
  '#': 'number',
  d: 'number',
  m: 'number',
  y: 'number',
};

const clamp = (num, min, max) => '' + Math.min(Math.max(num, min), max);

const clampers = {
  d: (num) => clamp(num, 1, 31),
  m: (num) => clamp(num, 1, 12),
  y: (num) => clamp(num, 25, 99),
};

const autoCompleteRange = {
  d: (num) => num > 4,
  m: (num) => num > 1,
};

export function formatString(str = '', format = 'mm/yy') {
  //
  let result = '';
  let nextToken = null;
  let digit = 0;
  let value = '';
  let autoComplete = false;
  let i = 0; // index in value
  const separators = format.replace(/[dmy#]/g, '');

  for (let j = 0; j < format.length; j++) {
    // skip non-fit characters
    if (i < str.length && !isNumber(str[i]) && !separators.includes(str[i])) {
      i++;
      j--;
      continue;
    }
    if (i >= str.length && !autoComplete) break;

    const token = format[j];
    nextToken = format[j + 1];

    if (types[token] === 'number') {
      digit++;
      if (isNumber(str[i]) && !autoComplete) value += str[i++]; //autoComplete = checkAutoComplete(token, part);

      if (nextToken !== token && clampers[token]) value = clampers[token](value);

      autoComplete = checkAutoComplete(token, value);
    } else {
      const pad = repeat('0', digit - value.length);
      digit = 0;
      result += pad + value;
      if (i < str.length) result += token;
      value = '';
      autoComplete = false;
      if (str[i] === token) i++;
    }
  }
  const pad = repeat('0', digit - value.length);
  return result + pad + value;
}

const checkAutoComplete = (token, num) => autoCompleteRange[token]?.(+num) ?? false;

const isNumber = (char) => /\d/.test(char);

const repeat = (str, count) => str.repeat(count);
