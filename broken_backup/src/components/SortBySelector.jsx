import { useCallback } from 'react';
import Select from './Select';
import { useSearchParams } from 'react-router';

export default function SortBySelector(props) {
  const [params, setParams] = useSearchParams();

  const getInitialValue = useCallback(() => {
    const sortBy = params.get('sortBy');
    if (!sortBy) return 'featured';
    const order = params.get('order');
    return order ? `${sortBy}:${order}` : sortBy;
  }, [params]);

  const handleSelect = (e) => {
    const { value } = e.target;
    const sortBy = value.split(':')[0];
    if (sortBy === 'featured') {
      setParams(
        (prev) => {
          prev.delete('sortBy');
          prev.delete('order');
          return prev;
        },
        { replace: true }
      );
      return;
    }

    const order = value.split(':')[1];
    setParams(
      (prev) => {
        prev.set('sortBy', sortBy);
        prev.set('order', order || 'asc');
        return prev;
      },
      { replace: true }
    );
  };

  const options = [
    { label: 'Featured', value: 'featured' },
    { label: 'Price: Low to High', value: 'price:asc' },
    { label: 'Price: High to Low', value: 'price:desc' },
    { label: 'Alphabetical A-Z', value: 'title:asc' },
    { label: 'Alphabetical Z-A', value: 'title:desc' },
    { label: 'Discount', value: 'discountPercentage:desc' },
  ];
  return <Select {...props} onChange={handleSelect} name='sortBy' type='select' defaultValue={getInitialValue} options={options} optionProps={{ className: 'hover-effect' }} icon={'/icons/sort.svg'} />;
}
