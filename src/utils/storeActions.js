export const PRODUCT_ACTIONS = {
  update: 'update',
  add: 'add',
  idle: 'idle',
};

export const initialActionState = {
  title: null,
  type: null,
};

export function productActionsReducer(state, action) {
  switch (action) {
    case PRODUCT_ACTIONS.update:
      return {
        ...state,
        title: 'Update Product',
        type: PRODUCT_ACTIONS.update,
      };
    case PRODUCT_ACTIONS.add:
      return {
        ...state,
        title: 'Add Product',
        type: PRODUCT_ACTIONS.add,
      };
    case PRODUCT_ACTIONS.idle:
      return {
        ...state,
        type: PRODUCT_ACTIONS.idle,
      };
    default:
      return {
        ...state,
        type: null,
      };
  }
}
