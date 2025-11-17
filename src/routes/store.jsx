import '../styles/store.css';
import '../styles/orders.css';
import { memo, use, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import useStoreOrders from '../hooks/useStoreOrders';
import { useSearchParams, Link, useSubmit, useActionData } from 'react-router';
import Grid, { Row, Col } from '../components/Grid';
import OrderList from '../components/OrderList';
import Icon from '../components/Icon';
import Select, { Option } from '../components/Select';
import SearchBar from '../components/SearchBar';
import Btn from '../components/Btn';
import useImageUpload from '../hooks/useImageUpload';
import ImageFilesProvider from '../contexts/ImageFilesProvider';
import useImageFiles from '../hooks/useImageFiles';
import CircularProgressBar from '../components/CircularProgressBar';
import useSearchStoreProducts from '../hooks/useSearchStoreProducts';
import ProductProvider from '../contexts/ProductProvider';
import useProductContext from '../hooks/useProductContext';
import useCategories from '../hooks/useCategories';
import UpdateForm from '../components/UpdateForm';
import useUpdateFormContext from '../hooks/useUpdateFormContext';
import api from '../utils/api';
import { slugParser } from '../utils/slugParser';
import useConfirm from '../hooks/useConfirm';

export default function Store() {
  const [content, setContent] = useState({ title: 'Orders', value: 'orders' });
  const [params, setParams] = useSearchParams();
  const tabs = useRef([
    { title: 'Orders', icon: '/icons/sales.svg', value: 'orders' },
    { title: 'Products', icon: '/icons/add-product.svg', value: 'products' },
  ]);

  const setPageContent = useCallback(
    (newContent) => {
      let index = tabs.current.findIndex((tab) => tab.value === newContent);
      const newParams = new URLSearchParams(params);
      if (index === -1) index = 0;
      if (index === 0 && params.has('tab')) {
        newParams.delete('tab');
        setParams(newParams, { replace: true });
      }
      if (index > 0 && !params.has('tab', newContent)) {
        newParams.set('tab', newContent);
        setParams(newParams, { replace: true });
      }
      setContent(tabs.current[index]);
    },
    [setContent, params, setParams]
  );

  useEffect(() => {
    const tab = params.get('tab');
    if (tab) setPageContent(tab);
    if (!params.has('tab')) setContent(tabs.current[0]);
  }, [params, setPageContent, setContent]);

  return (
    <Grid>
      <Row name='store-row'>
        <Col name='store-content' title='Store Content'>
          <DashBoard tabs={tabs.current} content={content} setContent={setPageContent} />
          <h2 className='content-title'>{content.title}</h2>
          {content.value === 'orders' && <OrdersTab />}
          {content.value === 'products' && <ProductsTab />}
        </Col>
      </Row>
    </Grid>
  );
}

function DashBoard({ tabs, content, setContent }) {
  const handleChange = (e) => {
    setContent(e.target.value);
  };
  return (
    <div className='store-dashboard'>
      <div className='tabs'>
        <Select name='tabs' onChange={handleChange} icon='/icons/arrow-down.svg' defaultValue={content.value}>
          {tabs.map((props, i) => (
            <DashBoardOption key={props.title + i} {...props} />
          ))}
        </Select>
        <ul className='tabs-list flex'>
          {tabs.map((props, i) => {
            return <DashBoardItem active={props.value === content.value} key={i} {...props} setContent={setContent} />;
          })}
        </ul>
      </div>
    </div>
  );
}

function DashBoardOption({ title, icon, value }) {
  return (
    <Option value={value}>
      <Icon icon={icon} />
      <span>{title}</span>
    </Option>
  );
}

function DashBoardItem({ title, icon, active, value, setContent, ...props }) {
  return (
    <li {...props} className={'tabs-list-item flex' + (active ? ' active' : '')} onClick={() => setContent(value)}>
      <Icon icon={icon} />
      <span>{title}</span>
    </li>
  );
}

function OrdersTab() {
  const [params, setParams] = useState(new URLSearchParams());
  const { data, fetchNextPage, hasNextPage, limit, isFetching } = useStoreOrders(params);
  const orders = data?.pages.reduce((acc, { orders }) => [...acc, ...orders], []);
  return (
    <>
      <meta name='description' content='Orders' />
      <title>Store | Orders</title>
      <OrderList orders={orders} isFetching={isFetching} hasNextPage={hasNextPage} limit={limit} fetchNextPage={fetchNextPage} params={params} setParams={setParams} />
    </>
  );
}

function ProductsTab() {
  return (
    <>
      <meta name='description' content='Store | Products' />
      <title>Store | Products</title>
      <div className='store-products'>
        <ProductProvider>
          <ProductActions />
          <hr />
          <UpdateProduct />
        </ProductProvider>
      </div>
    </>
  );
}

function ProductActions() {
  const [query, setQuery] = useState('');
  const { data, isFetching, fetchNextPage, hasNextPage, limit } = useSearchStoreProducts(new URLSearchParams({ q: query }));

  const products = useMemo(() => data?.pages?.reduce((acc, { products }) => [...acc, ...products], []), [data]);
  const total = data?.pages?.[0]?.total;

  const handleSearch = (e) => {
    const query = e.target.query.value;
    if (!query || query === '') return;
    setQuery(query);
  };
  return (
    <>
      <div>
        <SearchBar className='product-search flex' onSubmit={handleSearch} placeholder='Search by name, sku or id'>
          <Btn type='submit' className='small-btn'>
            Search
          </Btn>
        </SearchBar>
        <ProductActionButtons />
      </div>
      <SearchResults total={total} productCount={products?.length} fetchMore={fetchNextPage} hasMore={hasNextPage} fetchLimit={limit} products={products} isFetching={isFetching && query !== ''} />
    </>
  );
}

const MemoizedSearchResults = memo(StoreProductCard, (prev, next) => prev.product?.id === next.product?.id && prev.isSelected === next.isSelected);

function SearchResults({ products, productCount, total, isFetching, fetchMore, hasMore, fetchLimit }) {
  const selected = useProductContext((s) => s?.product);
  return (
    <div className='store-search-results flex-col'>
      {(products?.length === 0 || !products) && !isFetching && <strong className='pale'>No results found.</strong>}
      {products?.map((product) => {
        const isSelected = selected?.id === product?.id;
        return <MemoizedSearchResults key={'store-product-card' + product.id} product={product} isSelected={isSelected} />;
      })}
      {isFetching && [...Array(fetchLimit)].map((_, i) => <StoreProductCardSkeleton key={'__skeleton_card' + i} />)}
      <br />
      {productCount > 0 && (
        <div className='flex center-all'>
          <strong className='pale'>
            {productCount}/{total}
          </strong>
        </div>
      )}
      {hasMore && (
        <div className='flex center-all'>
          <Btn onClick={fetchMore}>Next</Btn>
        </div>
      )}
    </div>
  );
}

function StoreProductCard({ product, isSelected }) {
  const setSelected = useProductContext((s) => s?.setProduct);

  const handleClick = () => {
    if (isSelected) setSelected(null);
    else setSelected(product);
  };
  return (
    <div className={'card store-product-card flex-col' + (isSelected ? ' selected' : '')} onClick={handleClick} tabIndex={0}>
      <div className='image'>
        <img aria-label={product?.title + ' image'} loading='lazy' className='image-contain' src={product?.thumbnail} />
      </div>
      <div className='desc'>
        <p className='pale'>{product?.title}</p>
        <p>{product?.sku}</p>
        <p>
          <span className='pale id-text'>Product ID: </span>
          {product?.id}
        </p>
      </div>
    </div>
  );
}

function StoreProductCardSkeleton() {
  return (
    <div className='card store-product-card flex-col skeleton skeleton-body'>
      <div className='image skeleton-item skeleton-image'></div>
      <div className='desc skeleton-item-fit'>
        <p>
          <span className='skeleton-item skeleton-text skeleton-item-200px'></span>
        </p>
        <p>
          <span className='skeleton-item skeleton-text skeleton-item-175px'></span>
        </p>
        <p>
          <span className='skeleton-item skeleton-text skeleton-item-100px'></span>
        </p>
      </div>
    </div>
  );
}

function ProductActionButtons() {
  return (
    <>
      <Btn className='small-btn'>Save</Btn>
      <Btn className='small-btn'>Cancel</Btn>
    </>
  );
}

function UpdateProduct() {
  const submitForm = useSubmit();
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

  const inputs = [
    { type: 'text', name: 'title', placeholder: 'Title', defaultValue: selectedProduct?.title, maxLength: 100, minLength: 6, required: true },
    { type: 'textarea', name: 'description', placeholder: 'Description', maxLength: 1000, minLength: 30, required: true, ref: descRef },
    { type: 'number', name: 'price', placeholder: 'Price', step: '0.01', defaultValue: selectedProduct?.price, size: 'md', required: true },
    { type: 'number', name: 'stock', placeholder: 'Stock', defaultValue: selectedProduct?.stock, size: 'md', required: true },
    { type: 'number', name: 'discountPercentage', placeholder: 'Discount Percentage', step: '0.01', defaultValue: selectedProduct?.discountPercentage, size: 'md' },
    { type: 'text', name: 'shippingInformation', placeholder: 'Shipping In (days)', defaultValue: selectedProduct?.shippingInformation, size: 'md', required: true },
    { type: 'text', name: 'brand', placeholder: 'Brand', defaultValue: selectedProduct?.brand, size: 'md' },
    { type: 'select', name: 'category', placeholder: 'Category', defaultValue: selectedProduct?.category, size: 'md', required: true, options: categoryList },
    { type: 'text', name: 'tags', placeholder: 'Tags', defaultValue: selectedProduct?.tags?.join(', '), required: true, pattern: "^[A-Za-z]+(?:[\\s\\-'][A-Za-z]+)*(?:\\s*,\\s*[A-Za-z]+(?:[\\s\\-'][A-Za-z]+)*)*$" },
  ];

  const handleSubmit = (e, changedFormData) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const productId = formData.get('productId');
    if (productId) changedFormData.set('productId', productId);
    // How do I send the form data to the action function?
    submitForm(changedFormData, { method: 'post', action: '/store?tab=products' });
  };

  useEffect(() => {
    // this is necessary for the textarea
    if (selectedProduct && descRef.current) descRef.current.value = selectedProduct?.description;
    else if (descRef.current) descRef.current.value = '';
  }, [selectedProduct]);

  const submittingMsg = selectedProduct ? 'Updating Product...' : 'Creating Product...';
  const submitText = selectedProduct ? 'Update' : 'Create';
  const successMsg = (actionData) => {
    const action = actionData?.action;
    return `Product ${action} successfully`;
  };
  return (
    <>
      <h3>{selectedProduct?.id ? 'Update Product' : 'Create New Product'}</h3>
      <UpdateForm
        onSubmit={handleSubmit}
        className='update-product'
        inputs={inputs}
        invalidMsgList={invalidMsgList}
        method='post'
        action='/store?tab=products'
        submitText={submitText}
        submittingMsg={submittingMsg}
        successMsg={successMsg}
        submitBtnClass='confirm'
      >
        {selectedProduct?.id && <input type='hidden' name='productId' value={selectedProduct?.id} />}
        <ImageFilesProvider>
          <ImageUploader />
        </ImageFilesProvider>
        <UpdateFormFooter />
      </UpdateForm>
    </>
  );
}

function ImageUploader() {
  const MAX_fILE_COUNT = useImageFiles((s) => s?.MAX_fILE_COUNT);
  const [touchedByUser, setTouchedByUser] = useState(false);
  const product = useProductContext((s) => s?.product);
  const files = useImageFiles((s) => s?.files);
  const setFiles = useImageFiles((s) => s?.setFiles);
  const selected = useImageFiles((s) => s?.selected);
  const setSelected = useImageFiles((s) => s?.setSelected);
  const addFiles = useImageFiles((s) => s?.addFiles);
  const uploadRequired = useMemo(() => files?.size > 0 && Array.from(files.values()).some((file) => !file?.isCompleted), [files]);
  const isUploading = useMemo(() => files?.size > 0 && Array.from(files.values()).some((file) => file?.isUploading), [files]);
  const confirm = useConfirm();

  const validityRef = useRef();
  const inputRef = useRef();

  const handleChange = (e) => {
    if (!touchedByUser) setTouchedByUser(true);
    addFiles(Array.from(e.target.files));
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleRemoveAll = () => {
    if (!touchedByUser) setTouchedByUser(true);
    Array.from(files.values()).forEach((file) => {
      if (file.onCancel && file.isUploading) file.onCancel();
      URL.revokeObjectURL(file.localUrl);
    });
    setFiles(new Map());
    setSelected([]);
  };

  const handleRemove = async () => {
    if (!touchedByUser) setTouchedByUser(true);
    const message = selected.length === 1 ? 'this image' : `these ${selected.length} images`;
    const isConfirmed = await confirm({
      title: 'Remove',
      message: `Are you sure you want to remove ${message}?`,
      confirmText: 'Remove',
      content: <SelectedImages files={files} selected={selected} />,
      confirmBtnClass: 'danger',
      cancelBtnClass: 'light-gray',
    });
    if (!isConfirmed) return;
    const newFiles = new Map(files);
    for (const name of selected) {
      const file = newFiles.get(name);
      if (file.isUploading && file.onCancel) {
        file.onCancel();
      }
      URL.revokeObjectURL(newFiles.get(name).localUrl);
      newFiles.delete(name);
    }
    setFiles(newFiles);

    setSelected([]);
  };

  const handleUpload = async () => {
    await Promise.all(
      files.values().map(async (file) => {
        if (file.isUploading || file.isCompleted) return;
        setFiles((files) => {
          const newFiles = new Map(files);
          newFiles.set(file.name, { ...file, isUploading: true });
          return newFiles;
        });
        const res = await file.onUpload();
        if (!res || res.aborted) return;
        setFiles((files) => {
          const newFiles = new Map(files);
          newFiles.set(file.name, { ...file, isUploading: false, isCompleted: true, url: res?.data?.location });
          return newFiles;
        });
      })
    );
  };

  useEffect(() => {
    setFiles(new Map());
    setSelected([]);
    setTouchedByUser(false);
    if (!product) return;

    setFiles((files) => {
      const newFiles = new Map(files);
      product.images.forEach((image, index) => {
        const name = '__product-image' + index;
        newFiles.set(name, { url: image, name, isUploading: false, isCompleted: true });
      });
      return newFiles;
    });
  }, [product, setFiles, setSelected]);

  const invalid = isUploading || uploadRequired || !files?.size;
  const valid = !invalid && touchedByUser;
  useEffect(() => {
    if (!validityRef.current) return;
    const message = uploadRequired ? 'All images must be uploaded before continuing.' : 'At least one image must be uploaded.';
    validityRef.current.setCustomValidity(invalid ? message : '');
  }, [uploadRequired, invalid]);

  return (
    <fieldset required className={'image-uploader flex-col' + (invalid && touchedByUser ? ' invalid' : '') + (valid ? ' valid' : '')}>
      <legend>Images</legend>
      <ImageActionButtons onRemove={handleRemove} onRemoveAll={handleRemoveAll} onUpload={handleUpload} />
      <ImageList ref={inputRef} onChange={handleChange} />
      <hr />
      <p className='file-count note pale text-center'>
        {files?.size || 0}/{MAX_fILE_COUNT}
      </p>
      {invalid && touchedByUser && <input ref={validityRef} name='' required type='text' style={{ width: 0, height: 0, border: 'none' }} />}
      {isUploading && <p className='note pale'>Waiting for images to upload...</p>}
      {!files?.size && touchedByUser && <p className='note error-msg'>At least one image is required.</p>}
      {uploadRequired && !isUploading && <p className='note error-msg'>All images must be uploaded before continuing.</p>}
    </fieldset>
  );
}

function SelectedImages({ files, selected }) {
  return (
    <div className='selected-images image-list'>
      {selected.map((name) => {
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
  const MAX_fILE_COUNT = useImageFiles((s) => s?.MAX_fILE_COUNT);
  const id = useId();
  const files = useImageFiles((s) => s?.files);
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
  }, [product, changedFieldsRef, updateChanges, files]);

  const disabled = files?.size >= MAX_fILE_COUNT;

  return (
    <>
      {files?.size > 0 && <p className='note pale'>First image will be the thumbnail of the product</p>}
      {!files?.size && <p className='note pale'>No images added yet</p>}
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

function ImageActionButtons({ onRemove, onRemoveAll, onUpload }) {
  const selected = useImageFiles((s) => s?.selected);
  const filesCount = useImageFiles((s) => s?.files?.size);
  const files = useImageFiles((s) => s?.files);
  const hasWaitingForUpload = useMemo(() => Array.from(files.values()).some((file) => !file.isUploading && !file.isCompleted), [files]);

  return (
    <div className='btn-group flex'>
      <Btn type='button' onClick={onRemoveAll} disabled={!filesCount}>
        Remove All
      </Btn>
      {
        <Btn type='button' onClick={onUpload} disabled={!filesCount || !hasWaitingForUpload}>
          Upload
        </Btn>
      }
      {
        <div className='action-buttons'>
          <Btn className='remove-btn' icon='/icons/delete.svg' iconSize='16px' type='button' disabled={!selected.length} onClick={() => onRemove()} />
        </div>
      }
    </div>
  );
}

function Images() {
  const selected = useImageFiles((s) => s?.selected);
  const setSelected = useImageFiles((s) => s?.setSelected);
  const files = useImageFiles((s) => s?.files);
  const handleSelection = (name) => {
    if (selected.includes(name)) setSelected(selected.filter((n) => n !== name));
    else setSelected([...selected, name]);
  };

  if (!files?.size) return null;

  return (
    <>
      {Array.from(files.values()).map((file, i) => (
        <Image key={i} progress={file.progress || 0} file={file} url={file.localUrl || file.url} onSelect={handleSelection} />
      ))}
    </>
  );
}

function Image({ file, url, onSelect }) {
  const { uploadProductImage, progress, isPending, isCompleted, cancel } = useImageUpload();
  const setFiles = useImageFiles((s) => s?.setFiles);
  const selected = useImageFiles((s) => s?.selected);

  useEffect(() => {
    setFiles((prev) => {
      const newFiles = new Map(prev);
      const newFile = newFiles.get(file.name);
      newFile.onUpload = async () => uploadProductImage(file.file);
      newFile.onCancel = () => cancel();
      newFiles.set(newFile.name, newFile);
      return newFiles;
    });
  }, []);

  const isUpdateCompleted = Boolean(file.url) || isCompleted;
  return (
    <div className={'image' + (isUpdateCompleted ? ' completed' : '')} onClick={() => onSelect(file.name)}>
      {!file.isCompleted && <CircularProgressBar progress={isPending || isCompleted ? progress : 0} isCompleted={isCompleted} />}
      {file.isCompleted && file.url && <input type='text' name='images' value={file.url} readOnly hidden />}
      <img className={'image-contain' + (selected.includes(file.name) ? ' selected' : '')} src={url} />
    </div>
  );
}

function UpdateFormFooter() {
  const selectedProduct = useProductContext((s) => s?.product);
  const actionData = useUpdateFormContext((s) => s?.actionData);
  const resetActionData = useUpdateFormContext((s) => s?.resetActionData);
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

export async function action({ request }) {
  const formData = await request.formData();
  const productId = formData.get('productId');
  formData.delete('productId');
  const data = Object.fromEntries(formData);
  if (data.images) data.images = formData.getAll('images');

  if (productId) {
    const res = await api.updateProduct(productId, data).catch(console.log);
    return res?.status === 200 ? { data: res.data, error: false, action: 'updated' } : { error: true, data: null, action: 'updated' };
  }

  const res = await api.createProduct(data).catch(console.log);
  return res?.status === 201 ? { data: res.data, error: false, action: 'created' } : { error: true, data: null, action: 'created' };
}
