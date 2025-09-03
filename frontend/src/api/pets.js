import api from './index';

// Get all pets for user
export const getPets = async () => {
  try {
    const response = await api.get('/pets');
    return response;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

// Create new pet
export const createPet = async (petData) => {
  try {
    const response = await api.post('/pets', petData);
    return response;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

// Feed pet
export const feedPet = async (petId) => {
  try {
    const response = await api.patch(`/pets/${petId}/feed`);
    return response;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

// Play with pet
export const playWithPet = async (petId) => {
  try {
    const response = await api.patch(`/pets/${petId}/play`);
    return response;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

// Sử dụng ability của pet
export const usePetAbility = async (petId, ability) => {
  try {
    const response = await api.post(`/pets/${petId}/use-ability`, { ability });
    return response;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};

// Delete pet
export const deletePet = async (petId) => {
  try {
    const response = await api.delete(`/pets/${petId}`);
    return response;
  } catch (error) {
    throw error.response || { data: { message: 'Network error' } };
  }
};
