import { useContextSelector } from 'use-context-selector';
import { UpdateFormContext } from '../contexts/UpdateFormProvider';

export default function useUpdateFormContext(selector = (s) => s) {
  return useContextSelector(UpdateFormContext, selector);
}
