import { createContext } from 'use-context-selector';
import { useState } from 'react';

export const ProductContext = createContext();

export default function ProductProvider({ children }) {
  const [product, setProduct] = useState();

  return <ProductContext.Provider value={{ product, setProduct }}>{children}</ProductContext.Provider>;
}
