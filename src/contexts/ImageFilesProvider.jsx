import { createContext } from 'use-context-selector';
import { useCallback, useReducer } from 'react';

export const ImageFilesContext = createContext();

export default function ImageFilesProvider({ children }) {
  const [images, dispatchFiles] = useReducer(filesReducer, initialFiles);

  const uploadFiles = useCallback(async () => {
    const { files } = images;
    return await Promise.all(
      files.values().map(async (file) => {
        if (file.isUploading || file.isCompleted || !file.onUpload) return;
        dispatchFiles({ type: FILE_ACTIONS.upload_start, name: file.name });
        const res = await file.onUpload().catch((err) => {
          dispatchFiles({ type: FILE_ACTIONS.upload_fail, name: file.name, error: err });
          console.error(err);
        });
        if (!res || res.aborted) {
          dispatchFiles({ type: FILE_ACTIONS.upload_fail, name: file.name });
          return;
        }
        // loaction prop from api response
        dispatchFiles({ type: FILE_ACTIONS.upload_success, name: file.name, url: res?.data?.location });
        return res;
      })
    ).then((res) => {
      if (res?.length) {
        dispatchFiles({ type: FILE_ACTIONS.all_settled });
      }
      return res;
    });
  }, [images]);
  return <ImageFilesContext.Provider value={{ uploadFiles, images, dispatchFiles }}>{children}</ImageFilesContext.Provider>;
}

export const FILE_ACTIONS = {
  add: 0,
  all_settled: 1,
  reset: 2,
  remove_selection: 3,
  remove_all: 4,
  select: 5,
  update_file: 6,
  upload_fail: 7,
  upload_start: 8,
  upload_success: 9,
};

const initialFiles = {
  files: new Map(),
  MAX_FILE_COUNT: 6,
  selection: [],
  isUploading: false,
  uploadRequired: false,
};

function filesReducer(state, action) {
  switch (action.type) {
    case FILE_ACTIONS.add:
      return handleAddFiles(state, action);
    case FILE_ACTIONS.all_settled:
      return handleAllSettled(state, action);
    case FILE_ACTIONS.reset:
      return handleResetFiles(state, action);
    case FILE_ACTIONS.remove_selection:
      return handleRemoveFiles(state);
    case FILE_ACTIONS.remove_all:
      return handleRemoveAllFiles(state);
    case FILE_ACTIONS.select:
      return handleSelectFile(state, action);
    case FILE_ACTIONS.update_file:
      return handleUpdateFile(state, action);
    case FILE_ACTIONS.upload_start:
      return handleUploadStart(state, action);
    case FILE_ACTIONS.upload_success:
      return handleUploadSuccess(state, action);
    case FILE_ACTIONS.upload_fail:
      return handleUploadFail(state, action);
    default:
      throw Error('Unknown action in image files reducer: ' + action.type + '.\n Expected: ' + Object.keys(FILE_ACTIONS).join(', '));
  }
}

function handleAddFiles(state, action) {
  const { files } = action;
  if (!files?.length) return state;
  const MAX_FILE_COUNT = state?.MAX_FILE_COUNT;
  const prev = state.files;
  const newFiles = new Map(prev);
  for (const file of files) {
    if (newFiles.size >= MAX_FILE_COUNT) break;
    if (newFiles.has(file.name)) continue;
    newFiles.set(file.name, {
      name: file.name,
      isUploading: false,
      isCompleted: false,
      localUrl: URL.createObjectURL(file),
      file,
    });
  }
  const uploadRequired = newFiles?.size > 0 && Array.from(newFiles.values()).some((file) => !file?.isCompleted);
  return { ...state, files: newFiles, uploadRequired };
}

function handleAllSettled(state) {
  const { files } = state;
  const uploadRequired = files?.size > 0 && Array.from(files.values()).some((file) => !file?.isCompleted);
  return { ...state, uploadRequired, isUploading: false };
}

function handleResetFiles(state, action) {
  const { files: prev } = state;
  const { files = [] } = action;
  prev.values().forEach((file) => {
    if (file.onCancel && file.isUploading && file.onCancel) file.onCancel();
    URL.revokeObjectURL(file.localUrl);
  });
  const newFiles = new Map();
  for (const file of files) {
    newFiles.set(file.name, file);
  }
  return {
    ...state,
    files: newFiles,
    selection: [],
  };
}

function handleRemoveFiles(state) {
  const { files, selection } = state;
  const newFiles = new Map(files);
  for (const name of selection) {
    const file = newFiles.get(name);
    if (file.isUploading && file.onCancel) {
      file.onCancel();
    }
    URL.revokeObjectURL(newFiles.get(name).localUrl);
    newFiles.delete(name);
  }

  const uploadRequired = newFiles?.size > 0 && Array.from(newFiles.values()).some((file) => !file?.isCompleted);

  return {
    ...state,
    uploadRequired,
    files: newFiles,
    selection: [],
  };
}

function handleRemoveAllFiles(state) {
  const { files } = state;
  files.values().forEach((file) => {
    if (file.onCancel && file.isUploading && file.onCancel) file.onCancel();
    URL.revokeObjectURL(file.localUrl);
  });
  return {
    ...state,
    uploadRequired: false,
    files: new Map(),
    selection: [],
  };
}

function handleSelectFile(state, action) {
  const { name } = action;
  const { selection, files } = state;
  if (!files.has(name)) return state;
  if (selection.includes(name)) return { ...state, selection: selection.filter((n) => n !== name) };
  return { ...state, selection: [...selection, name] };
}

function handleUpdateFile(state, action) {
  const { name, update } = action;
  const { files } = state;
  if (!files.has(name)) return state;
  const newFiles = new Map(files);
  const file = files.get(name);
  for (const [key, value] of Object.entries(update)) {
    file[key] = value;
  }
  newFiles.set(name, { ...file });
  return { ...state, files: newFiles };
}

function handleUploadStart(state, action) {
  const { name } = action;
  const { files } = state;
  if (!files.has(name)) return state;
  const newFiles = new Map(files);
  newFiles.set(name, { ...newFiles.get(name), isUploading: true });
  return { ...state, files: newFiles, isUploading: true, uploadRequired: false, isCompleted: false };
}

function handleUploadSuccess(state, action) {
  const { name, url } = action;
  const { files } = state;
  if (!files.has(name)) return state;
  const newFiles = new Map(files);
  newFiles.set(name, { ...newFiles.get(name), isUploading: false, isCompleted: true, url });
  return { ...state, files: newFiles };
}

function handleUploadFail(state, action) {
  const { name, error } = action;
  const { files } = state;
  if (!files.has(name)) return state;
  const newFiles = new Map(files);
  newFiles.set(name, { ...newFiles.get(name), isUploading: false, isCompleted: false, error, isFailed: true });
  return { ...state, files: newFiles };
}
