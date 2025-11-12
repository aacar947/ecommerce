import { createContext } from 'use-context-selector';
import { useState, useCallback } from 'react';

export const ImageFilesContext = createContext();

export default function ImageFilesProvider({ children }) {
  const MAX_fILE_COUNT = 6;
  const [files, setFiles] = useState(new Map());
  const [selected, setSelected] = useState([]);

  const addFiles = useCallback(
    (files) => {
      if (!files?.length) return;
      setFiles((prev) => {
        const newFiles = new Map(prev);
        for (const file of files) {
          if (newFiles.size >= MAX_fILE_COUNT) break;
          if (newFiles.has(file.name)) continue;
          newFiles.set(file.name, {
            name: file.name,
            isUploading: false,
            isCompleted: false,
            localUrl: URL.createObjectURL(file),
            file,
          });
        }
        return newFiles;
      });
    },
    [setFiles]
  );

  const updateFile = useCallback((name, update) => {
    setFiles((prev) => {
      const newFiles = new Map(prev);
      const file = newFiles.get(name);
      if (!file) return prev;
      for (const key in update) file[key] = update[key];
      newFiles.set(name, file);
      return newFiles;
    });
  });
  return <ImageFilesContext.Provider value={{ files, MAX_fILE_COUNT, addFiles, updateFile, setFiles, selected, setSelected }}>{children}</ImageFilesContext.Provider>;
}
