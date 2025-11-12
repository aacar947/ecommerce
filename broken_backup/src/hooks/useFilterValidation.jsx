import { useCallback } from 'react';
import { useSearchParams } from 'react-router';

export default function useFilterValidation() {
  const [params] = useSearchParams();
  const isValidChange = useCallback((input) => {
    const hasExactValue = params.has(input.name, input.value);
    switch (input.type) {
      case 'radio':
        return input.checked;
      case 'checkbox':
        return (input.checked && !hasExactValue) || (!input.checked && hasExactValue);
      case 'text':
      case 'number':
        const hasValue = params.has(input.name);
        return ((!hasExactValue && input.value !== '') || (hasValue && input.value === '')) && input.checkValidity();
      default:
        return false;
    }
  });

  return {
    isValidChange,
  };
}
