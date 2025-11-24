import { useEffect, useMemo, useRef, useState, useId, useCallback } from 'react';
import { Link, useSubmit } from 'react-router';
import useProductContext from '../../../hooks/useProductContext';
import useUpdateFormContext from '../../../hooks/useUpdateFormContext';
import useCategories from '../../../hooks/useCategories';
import { slugParser } from '../../../utils/slugParser';
import useImageUpload from '../../../hooks/useImageUpload';
import ImageFilesProvider, { FILE_ACTIONS } from '../../../contexts/ImageFilesProvider';
import useImageFiles from '../../../hooks/useImageFiles';
import CircularProgressBar from '../../../components/CircularProgressBar';
import useConfirm from '../../../hooks/useConfirm';
import { PRODUCT_ACTIONS } from '../../../utils/storeActions';
import UpdateForm from '../../UpdateForm';
import Btn from '../../Btn';
import Icon from '../../Icon';

export default function UpdateProduct({ action }) {
  const submitForm = useSubmit();
  const confirm = useConfirm();
  const selectedProduct = useProductContext((s) => s?.product);
  const descRef = useRef();
  const { data: categories } = useCategories();

  const categoryList = useMemo(() => categories?.map((c) => ({ value: c.slug, label: c.name })), [categories]);

  const invalidMsgList = {
    title: 'Title must be at least 6 characters long and at most 100 characters long',
    description: 'Description must be at least 30 characters long',
    price: 'Price must be a number with at most two decimal places.',
    stock: 'Stock must be a number with no decimal places.',
    discountPercentage: 'Discount Percentage must be a number with at most two decimal places.',
    shippingInformation: 'Shipping Information must be a number',
    tags: 'Enter one or more names separated by commas. Only letters, spaces, apostrophes, and hyphens are allowed.',
  };

  const inputs = useMemo(
    () => [
      { type: 'text', name: 'title', placeholder: 'Title', defaultValue: selectedProduct?.title, maxLength: 100, minLength: 6, required: true },
      { type: 'textarea', name: 'description', placeholder: 'Description', maxLength: 1000, minLength: 30, required: true, ref: descRef },
      { type: 'number', name: 'price', placeholder: 'Price', step: '0.01', defaultValue: selectedProduct?.price, size: 'md', required: true },
      { type: 'number', name: 'stock', placeholder: 'Stock', defaultValue: selectedProduct?.stock, size: 'md', required: true },
      { type: 'number', name: 'discountPercentage', placeholder: 'Discount Percentage', step: '0.01', defaultValue: selectedProduct?.discountPercentage, size: 'md' },
      { type: 'text', name: 'shippingInformation', placeholder: 'Shipping In (days)', defaultValue: selectedProduct?.shippingInformation, size: 'md', required: true },
      { type: 'text', name: 'brand', placeholder: 'Brand', defaultValue: selectedProduct?.brand, size: 'md' },
      { type: 'select', name: 'category', placeholder: 'Category', defaultValue: selectedProduct?.category, size: 'md', required: true, options: categoryList },
      { type: 'text', name: 'tags', placeholder: 'Tags', defaultValue: selectedProduct?.tags?.join(', '), required: true, pattern: "^[A-Za-z]+(?:[\\s\\-'][A-Za-z]+)*(?:\\s*,\\s*[A-Za-z]+(?:[\\s\\-'][A-Za-z]+)*)*$" },
    ],
    [selectedProduct, categoryList]
  );

  useEffect(() => {
    // this is necessary for the textarea
    if (selectedProduct && descRef.current) descRef.current.value = selectedProduct?.description;
    else if (descRef.current) descRef.current.value = '';
  }, [selectedProduct]);

  const submittingMsg = selectedProduct ? 'Updating Product...' : 'Creating Product...';
  const submitText = selectedProduct ? 'Update' : 'Add';

  const handleSubmit = async (e, changedFormData) => {
    e.preventDefault();
    const isConfirmed = await confirm({
      title: `${submitText} Product`,
      message: `Are you sure you want to ${submitText.toLowerCase()} this product?`,
      confirmText: submitText,
    });
    if (!isConfirmed) return;
    const formData = new FormData(e.target);
    const productId = formData.get('productId');
    if (productId) changedFormData.set('productId', productId);
    submitForm(changedFormData, { method: 'post', action: '/store?tab=products' });
  };

  const active = (action.type === PRODUCT_ACTIONS.add && !selectedProduct) || (action.type === PRODUCT_ACTIONS.update && selectedProduct?.id);

  return (
    <div className={'update-product-wrapper' + (active ? ' active' : '')}>
      <div>
        {action?.type && <hr />}
        {action?.title && <h3>{action.title}</h3>}
        <UpdateForm
          submitBtnClass='confirm'
          submitText={submitText}
          onSubmit={handleSubmit}
          className='update-product'
          inputs={inputs}
          invalidMsgList={invalidMsgList}
          method='post'
          action='/store?tab=products'
          submittingMsg={submittingMsg}
          successMsg={action === 'add' ? 'Product added successfully.' : 'Product updated successfully.'}
        >
          {selectedProduct?.id && <input type='hidden' name='productId' value={selectedProduct?.id} />}
          <ImageFilesProvider>
            <ImageUploader />
          </ImageFilesProvider>
          <UpdateFormFooter />
        </UpdateForm>
      </div>
    </div>
  );
}

function ImageUploader() {
  // TODO: add drag and drop support
  // TODO: add image preview
  const [touchedByUser, setTouchedByUser] = useState(false);
  const product = useProductContext((s) => s?.product);
  const filesCount = useImageFiles((s) => s?.images?.files.size);
  const uploadRequired = useImageFiles((s) => s?.images?.uploadRequired);
  const isUploading = useImageFiles((s) => s?.images?.isUploading);
  const MAX_FILE_COUNT = useImageFiles((s) => s?.images?.MAX_FILE_COUNT);
  const dispatchFiles = useImageFiles((s) => s?.dispatchFiles);

  const validityRef = useRef();
  const inputRef = useRef();

  const handleChange = (e) => {
    if (!touchedByUser) setTouchedByUser(true);
    const files = e.target.files;
    dispatchFiles({ type: FILE_ACTIONS.add, files: Array.from(files) });
    if (inputRef.current) inputRef.current.value = '';
  };

  useEffect(() => {
    const files = product?.images.map((image) => ({ name: image, isCompleted: true, url: image })) || [];
    dispatchFiles({ type: FILE_ACTIONS.reset, files });
  }, [product, dispatchFiles]);

  const invalid = isUploading || uploadRequired || !filesCount;
  const valid = !invalid && touchedByUser;
  useEffect(() => {
    if (!validityRef.current) return;
    const message = uploadRequired ? 'All images must be uploaded before continuing.' : 'At least one image must be uploaded.';
    validityRef.current.setCustomValidity(invalid ? message : '');
  }, [uploadRequired, invalid]);

  return (
    <fieldset required className={'image-uploader flex-col' + (invalid && touchedByUser ? ' invalid' : '') + (valid ? ' valid' : '')}>
      <legend>Images</legend>
      <ImageActionButtons touchedByUser={touchedByUser} setTouchedByUser={setTouchedByUser} />
      <ImageList ref={inputRef} onChange={handleChange} />
      <hr />
      <p className='file-count note pale text-center'>
        {filesCount || 0}/{MAX_FILE_COUNT}
      </p>
      {invalid && touchedByUser && <input ref={validityRef} name='' required type='text' style={{ width: 0, height: 0, border: 'none' }} />}
      {isUploading && <p className='note pale'>Waiting for images to upload...</p>}
      {!filesCount && touchedByUser && <p className='note error-msg'>At least one image is required.</p>}
      {uploadRequired && !isUploading && <p className='note error-msg'>All images must be uploaded before continuing.</p>}
    </fieldset>
  );
}

function SelectedImages({ files, selection }) {
  return (
    <div className='selected-images image-list'>
      {selection.map((name) => {
        const file = files.get(name);

        if (!file) return null;

        return (
          <div className='image' key={'selected-image-' + name}>
            <img className='image-contain' src={file.localUrl || file.url} aria-label={file.name} />
          </div>
        );
      })}
    </div>
  );
}

function ImageList({ ref, onChange }) {
  const id = useId();
  const images = useImageFiles((s) => s?.images);
  const product = useProductContext((s) => s?.product);
  const changedFieldsRef = useUpdateFormContext((s) => s?.changedFieldsRef);
  const updateChanges = useUpdateFormContext((s) => s?.updateChanges);
  const imageListRef = useRef();

  // TODO: add drag and drop support for rearranging images
  useEffect(() => {
    if (!imageListRef.current) return;
    const imageUrlList = Array.from(imageListRef.current.querySelectorAll('input[name="images"]'))
      .map((input) => input.value)
      .filter(Boolean);
    const isSameList = imageUrlList.toString() === product?.images.toString();

    if (imageUrlList.length === 0 || (product && isSameList)) {
      delete changedFieldsRef.current.images;
    } else if (imageUrlList.length > 0) {
      changedFieldsRef.current.images = imageUrlList;
    }
    updateChanges();
  }, [product, updateChanges, images]);

  const filesCount = images?.files.size;
  const disabled = filesCount >= images?.MAX_fILE_COUNT;

  return (
    <>
      {filesCount > 0 && <p className='note pale'>First image will be the thumbnail of the product</p>}
      {!filesCount && <p className='note pale'>No images added yet</p>}
      <div ref={imageListRef} className='image-list flex'>
        <Images />
        <input ref={ref} type='file' name='' id={id} onChange={onChange} multiple accept='image/*' />
        <label className='flex btn' htmlFor={id} tabIndex={0} data-disabled={disabled}>
          <Icon icon='/icons/add-image.svg' />
        </label>
      </div>
    </>
  );
}

function ImageActionButtons({ touchedByUser, setTouchedByUser }) {
  const images = useImageFiles((s) => s?.images);
  const filesCount = images?.files.size;
  const hasWaitingForUpload = useMemo(() => Array.from(images?.files?.values() || []).some((file) => !file.isUploading && !file.isCompleted), [images?.files]);
  const uploadFiles = useImageFiles((s) => s?.uploadFiles);
  const confirm = useConfirm();
  const dispatchFiles = useImageFiles((s) => s?.dispatchFiles);

  const handleRemoveAll = async () => {
    const isConfirmed = await confirm({
      title: 'Remove All',
      message: 'Are you sure you want to remove all images?',
      confirmText: 'Confirm',
      type: 'danger',
    });
    if (!isConfirmed) return;
    if (!touchedByUser) setTouchedByUser(true);
    dispatchFiles({ type: FILE_ACTIONS.remove_all });
  };

  const handleRemove = async () => {
    if (!touchedByUser) setTouchedByUser(true);
    const selection = images?.selection;
    const message = selection.length === 1 ? 'this image' : `these ${selection.length} images`;
    const isConfirmed = await confirm({
      title: 'Remove',
      message: `Are you sure you want to remove ${message}?`,
      confirmText: 'Confirm',
      content: <SelectedImages files={images.files} selection={images.selection} />,
      type: 'danger',
    });
    if (!isConfirmed) return;
    dispatchFiles({ type: FILE_ACTIONS.remove_selection });
  };

  const handleUpload = async () => {
    const isConfirmed = await confirm({
      title: 'Upload',
      message: 'Are you sure you want to upload images?',
      confirmText: 'Upload',
    });
    if (!isConfirmed) return;
    uploadFiles();
  };

  return (
    <div className='btn-group flex'>
      <Btn type='button' onClick={handleRemoveAll} disabled={!filesCount}>
        Remove All
      </Btn>
      {
        <Btn type='button' onClick={handleUpload} disabled={!filesCount || !hasWaitingForUpload}>
          Upload
        </Btn>
      }
      {
        <div className='action-buttons'>
          <Btn className='remove-btn' icon='/icons/delete.svg' iconSize='16px' type='button' disabled={!images?.selection.length} onClick={handleRemove} />
        </div>
      }
    </div>
  );
}

function Images() {
  const images = useImageFiles((s) => s?.images);
  const dispatchFiles = useImageFiles((s) => s?.dispatchFiles);
  const filesCount = images?.files.size;

  const handleSelection = (name) => {
    dispatchFiles({ type: FILE_ACTIONS.select, name });
  };

  if (!filesCount) return null;

  return (
    <>
      {Array.from(images?.files.values()).map((file, i) => (
        <Image key={i} progress={file.progress || 0} file={file} url={file.localUrl || file.url} onSelect={handleSelection} />
      ))}
    </>
  );
}

function Image({ file, url, onSelect }) {
  const { uploadProductImage, progress, isPending, isCompleted, cancel } = useImageUpload();
  const dispatchFiles = useImageFiles((s) => s?.dispatchFiles);
  const images = useImageFiles((s) => s?.images);

  useEffect(() => {
    const update = {
      onUpload: () => uploadProductImage(file.file),
      onCancel: () => cancel(),
    };
    dispatchFiles({ type: FILE_ACTIONS.update_file, name: file.name, update });
  }, [file.name, file.file, uploadProductImage, cancel, dispatchFiles]);

  const isUpdateCompleted = Boolean(file.url) || isCompleted;
  return (
    <div className={'image' + (isUpdateCompleted ? ' completed' : '')} onClick={() => onSelect(file.name)}>
      {!file.isCompleted && <CircularProgressBar progress={isPending || isCompleted ? progress : 0} isCompleted={isCompleted} />}
      {file.isCompleted && file.url && <input type='text' name='images' value={file.url} readOnly hidden />}
      <img className={'image-contain' + (images?.selection.includes(file.name) ? ' selected' : '')} src={url} />
    </div>
  );
}

function UpdateFormFooter() {
  const selectedProduct = useProductContext((s) => s?.product);
  const resetActionData = useUpdateFormContext((s) => s?.resetActionData);
  const actionData = useUpdateFormContext((s) => s?.actionData);
  const data = actionData?.data;
  const action = actionData?.action;
  const slug = slugParser.slugify({ id: data?.id, title: data?.title });

  useEffect(() => {
    resetActionData();
  }, [selectedProduct, resetActionData]);

  if (!action) return null;

  return (
    <div className='update-form-footer'>
      <p>
        Product {action} successfully, checkout the <Link to={`/p/${slug}`}>product page</Link> for more details.
      </p>
    </div>
  );
}
