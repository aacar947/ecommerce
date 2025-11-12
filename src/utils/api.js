import axios from 'axios';
import ls from './localStorageHandler';

const API_BASE_URL = 'https://dummyjson.com';

const instance = axios.create({
  baseURL: API_BASE_URL,
});

instance.interceptors.response.use((res) => {
  if (res.status >= 200 && res.status < 300) {
    res.statusText = 'OK';
  } else if (res.status >= 400 && res.status < 500) {
    res.statusText = 'Client Error';
  } else if (res.status >= 500) {
    res.statusText = 'Server Error';
  }
  return res;
});

async function addToCart(userId, products = []) {
  if (!userId || !products || products.length === 0) {
    console.error('User ID and Product ID are required to add to cart');
    return Promise.reject(new Error('User ID and Products are required'));
  }
  // Merge with existing cart if it exists
  // If no cart exists, a new one will be created
  // This is useful for users who may not have a cart yet
  // or for guest users who are not logged in
  // Note: This assumes that the backend API supports merging carts
  // If the backend does not support merging, you may need to handle this differently
  let cartId;

  try {
    const response = await getCartByUser(userId);
    cartId = response?.cart?.id;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return Promise.reject(error);
  }

  if (cartId) {
    return instance({
      url: `carts/${cartId}`,
      method: 'put',
      data: {
        merge: true, // Merge with existing cart
        products,
      },
    })
      .then(returnCartResponse)
      .catch((error) => {
        console.error(error);
        return Promise.reject(error);
      });
  } else {
    // If no cart exists, create a new one
    return instance({
      url: 'carts/add',
      method: 'post',
      data: {
        userId,
        products,
      },
    })
      .then(returnCartResponse)
      .catch((error) => {
        console.error(error);
        return Promise.reject(error);
      });
  }
}

function addToWishlist(userId, productId) {
  // dummy api does not support wishlist
  // imitate by adding to cart
  return addToCart(userId, [{ id: productId, quantity: 1 }]);
}

function createProduct(product) {
  return instance({
    url: 'products/add',
    method: 'post',
    data: product,
  }).catch((error) => {
    console.error(error);
    return Promise.reject(error);
  });
}

function login({ email, password }) {
  return instance({
    method: 'post',
    url: 'auth/login',
    data: {
      username: email,
      password,
      expiresInMins: 30, // optional, defaults to 60
    },
    headers: { 'Content-Type': 'application/json' },
    withCredentials: false, // Include cookies (e.g., accessToken) in the request
  })
    .then(saveTokenToLocalStorage) // Do not use localStorage to store tokens in production. It is vulnerable to cross-site scripting (XSS) attacks, which can expose sensitive authentication data to malicious scripts. Consider using HTTP-only secure cookies instead for improved security.
    .catch((error) => console.error(error));
}

function saveTokenToLocalStorage(res) {
  if (!res.data) return res;
  ls.set('refresh_token', res.data.refreshToken);
  return res;
}

function getUser() {
  /* providing accessToken in bearer */
  return instance({
    url: 'auth/me',
    method: 'get',
    withCredentials: false, // Include cookies (e.g., accessToken) in the request
  });
}

function logout(accessToken) {
  return instance({
    url: 'auth/logout',
    method: 'post',
    headers: {
      Authorization: `Bearer ${accessToken}`, // Pass JWT via Authorization header
    },
    credentials: 'include', // Include cookies (e.g., accessToken) in the request
  })
    .then((res) => {
      ls.set('refresh_token', null); // Clear refresh token
      return res;
    })
    .catch((err) => console.error(err));
}

function refreshToken() {
  const refreshToken = ls.get('refresh_token');

  return instance({
    url: 'auth/refresh',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      // Do not use localStorage to store tokens in production.
      // It is vulnerable to cross-site scripting (XSS) attacks,
      // which can expose sensitive authentication data to malicious scripts.
      // Consider using HTTP-only secure cookies instead for improved security.
      refreshToken,
      expiresInMins: 30,
    },
    _skipAuth: true,
  }).catch((err) => {
    console.error(err);
    return Promise.reject(err);
  });
}

function updateUser(id, update) {
  return instance({
    url: `/users/${id}`,
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      ...update,
    },
  }).catch((error) => console.error(error));
}

function updateGuestAddress(address) {
  ls.set('address', address);
  return Promise.resolve({ status: 200, statusText: 'OK', address });
}

function getGuestAddress() {
  return Promise.resolve({ status: 200, statusText: 'OK', address: ls.get('address') });
}

function returnCartResponse({ data, statusText, status, userId, ...rest }) {
  // Test api does not support for guest users
  const defaultCart = {
    id: userId ? undefined : 1,
    userId: userId || 1, // Default to user ID 1 if not provided for guest users
    products: [],
    total: 0,
    totalQuantity: 0,
    totalProducts: 0,
    discountedTotal: 0,
  };
  if (statusText === 'OK') {
    return { cart: data || defaultCart, statusText, status, ...rest };
  }
  return Promise.reject(new Error('Failed to fetch cart'));
}

function getCartByUser(userId) {
  return instance({
    url: `carts/user/${userId}`,
    method: 'get',
  })
    .then(({ data, statusText, status, ...rest }) => returnCartResponse({ data: data?.carts[0], statusText, status, userId, ...rest }))
    .catch((error) => console.error(error));
}

function updateCart(id, products) {
  return instance({
    url: `/carts/${id}`,
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      merge: true,
      products,
    },
  })
    .then(returnCartResponse)
    .catch((error) => console.error(error));
}

function updateProduct(id, update) {
  return instance({
    url: `/products/${id}`,
    method: 'put',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {
      ...update,
    },
  });
}

function uploadProductImage(image, onUploadProgress, signal) {
  const formData = new FormData();
  formData.append('file', image);
  return instance({
    url: 'https://api.escuelajs.co/api/v1/files/upload',
    method: 'post',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    signal,
    data: formData,
    onUploadProgress,
  }).catch((error) => {
    console.error(error);
    return Promise.reject(error);
  });
}

async function removeFromUserCart(userId, productId) {
  let cartId;

  try {
    const response = await getCartByUser(userId);
    cartId = response?.cart?.id;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return Promise.reject(error);
  }

  if (cartId) return updateCart(cartId, [{ id: productId, quantity: 0 }]);

  return Promise.reject(new Error('Cart not found'));
}

async function removeFromGuestCart(productId) {
  const guestCart = ls.get('cart');
  if (!guestCart) return getGuestCart();

  delete guestCart[productId];
  ls.set('cart', guestCart);
  return await getGuestCart();
}

function removeFromWishlist(userId, productId) {
  return removeFromUserCart(userId, productId);
}

function updateGuestCart(products = []) {
  if (!products || products.length === 0) {
    console.error('Products are required to update guest cart');
    return Promise.reject(new Error('Products are required'));
  }

  const guestCart = ls.get('cart') || {};
  if (!guestCart) {
    guestCart = {};
    ls.set('cart', guestCart); // Initialize with an empty cart if none exists
  }

  products.forEach(({ id, quantity }) => {
    if (quantity === 0) return delete guestCart[id];
    if (!guestCart[id]) return (guestCart[id] = { id, quantity });
    guestCart[id].quantity = quantity;
  });
  ls.set('cart', guestCart);

  return getGuestCart();
}

function addToGuestCart(products = []) {
  if (!products || products.length === 0) {
    console.error('Products are required to add to guest cart');
    return Promise.reject(new Error('Products are required'));
  }

  let guestCart = ls.get('cart');
  if (!guestCart) {
    guestCart = {};
    ls.set('cart', guestCart); // Initialize with an empty cart if none exists
  }

  products.forEach(({ id, quantity }) => {
    if (quantity === 0) return delete guestCart[id];
    if (guestCart[id]) {
      // If the product already exists in the local cart, update its quantity
      guestCart[id].quantity += quantity;
    } else {
      // If the product does not exist in the local cart, add it
      guestCart[id] = { id, quantity };
    }
    // if quantity is 0, remove the product from the cart
    if (guestCart[id].quantity <= 0) delete guestCart[id];
  });

  ls.set('cart', guestCart);
  // This should be handled by the backend API
  // If the product already exists in the cart, update its quantity and total
  // This is a hack to simulate adding to a cart because the placeholder backend API does not support guest carts
  return getGuestCart();
}

async function getGuestCart() {
  // local Cart only has a list of productId and quantity
  let localCart = ls.get('cart') || {};

  const products = Object.values(localCart);

  if (products.length === 0) return getCartByUser(1); // If no products, return an empty cart
  return await instance({
    url: 'carts/add',
    method: 'post',
    data: {
      userId: 1, // Dummy user ID for local cart
      products,
    },
  })
    .then(returnCartResponse)
    .catch((error) => console.error(error));
}

function getOrder(orderId) {
  return instance({
    url: `carts/${orderId}`,
    method: 'get',
  })
    .then(async (res) => {
      res.data = await returnFakeOrder(res.data);
      return res;
    })
    .catch((error) => console.error(error));
}

async function returnFakeOrder(order) {
  const dummyAddress = {
    name: 'John Doe',
    address: '625 Third Street',
    city: 'Denver',
    state: 'Oregon',
    country: 'United States',
    postalCode: '67345',
    phone: '+90 123-456-7890',
  };

  const methods = ['credit', 'debit'];

  const orderStatus = await getOrderStatusList().then((res) => res.data);
  const date = new Date();
  order.statusCode = order.id % orderStatus.length;
  order.address = dummyAddress;
  order.billingAddress = dummyAddress;
  order.status = orderStatus[order.statusCode];
  order.updatedAt = date.toISOString();
  order.orderedAt = new Date(date.setDate(date.getDate() - 2)).toISOString();
  order.cardNumber = '5184 *** *** 1111';
  order.paymentMethod = methods[Math.floor(Math.random() * methods.length)];
  order.paymentNetwork = 'Visa'; // Visa, Mastercard, American Express etc.
  order.paymentIssuer = 'Bank of America';
  order.shippingCost = 0;
  return order;
}

async function getOrders(userId, params) {
  // mock orders
  const res = await instance({
    url: `carts/user/${userId}`,
    params,
    method: 'get',
  }).catch((error) => {
    console.error(error);
    return Promise.reject(error);
  });

  res.data.orders = res.data.carts;
  delete res.data.carts;
  for (let i = 0; i < res.data.orders.length; i++) {
    res.data.orders[i] = await returnFakeOrder(res.data.orders[i]);
  }
  return res;
}

// mock order status list
function getOrderStatusList() {
  const orderStatusList = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Returned'];
  return mockApiResponse(orderStatusList);
}

function mergeWithGuestCart(userId) {
  const guestCart = ls.get('cart') || {};
  const products = Object.values(guestCart);
  let res = null;
  if (products.length === 0) {
    res = Promise.resolve({ status: 200, statusText: 'OK' }); // No products to merge
  } else res = addToCart(userId, products);

  return res
    .then((res) => {
      if (res.statusText === 'OK') {
        removeGuestCart(); // Clear the guest cart after merging
        return res;
      }
      return Promise.reject(new Error('Failed to merge guest cart'));
    })
    .catch((error) => {
      console.error('Error merging guest cart:', error);
      return Promise.reject(error);
    });
}

function postReview(review) {
  const { rating, productId, userId } = review;
  if (!rating || !productId || !userId) return Promise.reject(new Error('Missing required fields'));
  return mockApiResponse(review, 1000);
}

function removeGuestCart() {
  ls.set('cart', {}); // Clear the local cart
  return Promise.resolve({ status: 201, statusText: 'OK' }); // Simulate a successful response
}

function getProduct(id, params = new URLSearchParams()) {
  return instance({
    url: `products/${id}`,
    method: 'get',
    params,
  })
    .then((res) => res.data)
    .catch((error) => {
      console.error(error);
      return Promise.reject(error);
    });
}

function getProducts() {
  return instance({
    url: 'products',
    method: 'get',
  })
    .then((res) => res.data.products)
    .catch((error) => {
      console.error(error);
      return error;
    });
}

async function getProductsByCategory(category, params = new URLSearchParams()) {
  return await instance({
    url: `products/category/${category}`,
    method: 'get',
    params,
  })
    .then(attachFilterTags)
    .then((res) => res.data)
    .catch((error) => {
      console.error(error);
    });
}

function getShowcase() {
  const showcase = [
    [
      {
        title: 'Smart Speakers',
        description: 'Smart speakers bring powerful sound and voice control to your home. Stream music, get answers, control smart devices, and enjoy hands-free convenience, all in one sleek device.',
        image: 'https://cdn.dummyjson.com/product-images/mobile-accessories/amazon-echo-plus/2.webp',
        params: 'q=speaker',
      },
      {
        title: 'Explore Apple Products',
        description: 'Discover Apple`s iconic design, powerful performance, and seamless ecosystem. From iPhone to Mac, experience innovation that keeps you connected, creative, and ahead.',
        image: 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods/1.webp',
        params: 'q=apple',
      },
      {
        title: 'Power Meets Portability',
        description: 'Experience high performance, sleek design, and all-day productivity, laptops built to keep up with your lifestyle.',
        image: 'https://cdn.dummyjson.com/product-images/laptops/apple-macbook-pro-14-inch-space-grey/2.webp',
        params: 'q=laptop',
      },
    ],
    {
      productId: 101,
      title: 'Apple AirPods Max',
      image: 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-airpods-max-silver/1.webp',
    },
    {
      productId: 126,
      title: 'Oppo F19 Pro Plus',
      image: 'https://cdn.dummyjson.com/product-images/smartphones/oppo-f19-pro-plus/3.webp',
    },
    {
      productId: 159,
      title: 'iPad Mini 2021 Starlight',
      image: 'https://cdn.dummyjson.com/product-images/tablets/ipad-mini-2021-starlight/4.webp',
    },
    {
      productId: 106,
      title: 'Apple Watch Series 4 Gold',
      image: 'https://cdn.dummyjson.com/product-images/mobile-accessories/apple-watch-series-4-gold/1.webp',
    },
  ];

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(showcase);
    }, 1000);
  });
}

async function getStoreOrders(params = new URLSearchParams()) {
  const res = await instance({
    url: 'https://dummyjson.com/carts',
    method: 'get',
    params,
  }).catch((error) => {
    console.error(error);
    return error;
  });

  res.data.orders = res.data.carts;
  delete res.data.carts;
  for (let i = 0; i < res.data.orders.length; i++) {
    res.data.orders[i] = await returnFakeOrder(res.data.orders[i]);
  }
  return res;
}

function getWishlist(userId) {
  console.warn('Dummy API does not support wishlist. TODO: implement wishlist');
  // this should be like 'products/whishlist/:userId'
  // but dummy api does not support this
  return getProductsByCategory('beauty', new URLSearchParams({ userId }));
}

async function attachFilterTags(res) {
  if (!res) return null;
  const config = res.config;
  config?.params?.set('filter', 'brand,category');

  // Imitate a response from the backend that returns a list of categories and brands
  // along with the products
  const tags = await instance(config)
    .then((res) => res?.data?.products)
    .then((res) => {
      if (!res) return error;
      const categories = new Set();
      const brands = new Set();
      res.forEach((product) => {
        if (product.category) categories.add(product.category);
        if (product.brand) brands.add(product.brand);
      });
      return { categories: Array.from(categories), brands: Array.from(brands) };
    })
    .catch((error) => {
      console.error(error);
    });

  if (res.data) res.data.tags = tags;
  return res;
}

async function searchStoreProducts(params = new URLSearchParams()) {
  if (!params.has('q') || params.get('q') === '') return null;
  const querySearch = await searchQuery(params).catch((error) => {
    console.error(error);
    return null;
  });

  const idSearch = await getProduct(params.get('q'))
    .then((res) => {
      return { total: 1, products: [res], limit: 1, skip: 0 };
    })
    .catch((error) => {
      console.error(error);
      return null;
    });

  return idSearch || querySearch;
}

function searchQuery(params = new URLSearchParams()) {
  return instance({
    url: 'products/search',
    method: 'get',
    params,
  })
    .then(attachFilterTags)
    .then((res) => res.data)
    .catch((error) => {
      console.error(error);
      return error;
    });
}

async function getCategories() {
  return instance({
    url: 'products/categories',
    method: 'get',
  })
    .then((res) => res.data)
    .catch((error) => {
      console.error(error);
      return error;
    });
}

function mockApiResponse(data, delay = 100) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ status: 201, data, statusText: 'OK' });
    }, delay);
  });
}

export default {
  addToCart,
  addToGuestCart,
  addToWishlist,
  createProduct,
  getCartByUser,
  getCategories,
  getGuestAddress,
  getGuestCart,
  getOrder,
  getOrders,
  getOrderStatusList,
  getProduct,
  getProducts,
  getProductsByCategory,
  getShowcase,
  getStoreOrders,
  getUser,
  getWishlist,
  login,
  logout,
  mergeWithGuestCart,
  postReview,
  refreshToken,
  removeFromUserCart,
  removeFromGuestCart,
  removeFromWishlist,
  searchStoreProducts,
  searchQuery,
  updateUser,
  updateCart,
  updateProduct,
  uploadProductImage,
  updateGuestAddress,
  updateGuestCart,
};

export { instance };
