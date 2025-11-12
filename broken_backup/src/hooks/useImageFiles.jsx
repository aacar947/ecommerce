import { useContextSelector } from 'use-context-selector';
import { ImageFilesContext } from '../contexts/ImageFilesProvider';

export default function useImageFiles(selector = (s) => s || null) {
  return useContextSelector(ImageFilesContext, selector);
}
