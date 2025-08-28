import api from './index';

// Get shop items
export const getShopItems = async () => {
  const response = await api.get('/shop/items');
  return response.data;
};

// Buy item from shop
export const buyItem = async (itemId, quantity = 1) => {
  const response = await api.post('/shop/buy', { itemId, quantity });
  return response.data;
};

// Get user inventory
export const getUserInventory = async () => {
  const response = await api.get('/shop/inventory');
  return response.data;
};

// Use item from inventory
export const useItem = async (inventoryId, petId = null) => {
  const response = await api.post('/shop/inventory/use', { inventoryId, petId });
  return response.data;
};
