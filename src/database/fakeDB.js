export async function getProducts() {
  try {
    const data = await fetch('https://dummyjson.com/products').then((res) => res.json());
    return data?.products || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getProduct(id) {
  try {
    const data = await fetch(`https://dummyjson.com/product/${id}`).then((res) => {
      if (!res.ok) throw new Error(`Product with id '${id}' not found.`);
      return res.json();
    });
    return data || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getCategories() {
  try {
    const data = await fetch('https://dummyjson.com/products/categories').then((res) => res.json());
    return data || null;
  } catch (error) {
    console.error(error);
    return null;
  }
}
