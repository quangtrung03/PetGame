import api from './index';

// Get shop items
export const getShopItems = async () => {
  try {
    const response = await api.get('/shop/items');
    return response;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

// Buy item from shop
export const buyItem = async (itemId, quantity = 1) => {
  try {
    const response = await api.post('/shop/buy', { itemId, quantity });
    return response;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

// Get user inventory
export const getUserInventory = async () => {
  try {
    const response = await api.get('/shop/inventory');
    return response;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

// Use item from inventory
export const useItem = async (inventoryId, petId = null) => {
  try {
    const response = await api.post('/shop/inventory/use', { inventoryId, petId });
    return response;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};
