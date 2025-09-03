import React, { useState, useEffect } from 'react';
import { getPets, createPet } from '../api/pets';
import { useToast } from '../context/ToastContext';
import PetCard from '../components/PetCard';

const Pets = () => {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPet, setNewPet] = useState({
    name: '',
    type: 'cat',
  });
  const [error, setError] = useState('');
  const { addToast } = useToast();

  // Load pets on component mount
  useEffect(() => {
    loadPets();
  }, []);

  const loadPets = async () => {
    try {
      const response = await getPets();
      // Backend trả về { success, message, data: { pets } }
      setPets(response.data.data.pets);
    } catch (error) {
      console.error('Error loading pets:', error);
      setError('Không thể tải danh sách pet');
      addToast('❌ Không thể tải danh sách pet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePet = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    setError('');

    try {
      const response = await createPet(newPet);
      // Backend trả về { success, message, data: { pet } }
      setPets([...pets, response.data.data.pet]);
      setNewPet({ name: '', type: 'cat' });
      setShowCreateForm(false);
      addToast(`🎉 Đã tạo thành công ${response.data.data.pet.name}!`, 'success');
    } catch (error) {
      console.error('Error creating pet:', error);
      const errorMessage = error.message || 'Không thể tạo pet mới';
      setError(errorMessage);
      addToast(`❌ ${errorMessage}`, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePetUpdate = (updatedPet) => {
    setPets(pets.map(pet => 
      pet._id === updatedPet._id ? updatedPet : pet
    ));
  };

  const handlePetDelete = (petId) => {
    setPets(pets.filter(pet => pet._id !== petId));
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Thú cưng của tôi 🐾
            </h1>
            <p className="mt-2 text-gray-600">
              Bạn có {pets.length} thú cưng
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary"
          >
            ➕ Thêm Pet mới
          </button>
        </div>

        {/* Create Pet Form */}
        {showCreateForm && (
          <div className="card mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Tạo thú cưng mới
            </h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleCreatePet} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Tên thú cưng
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  className="input-field mt-1"
                  placeholder="Nhập tên cho thú cưng"
                  value={newPet.name}
                  onChange={(e) => setNewPet({ ...newPet, name: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Loại thú cưng
                </label>
                <select
                  id="type"
                  className="input-field mt-1"
                  value={newPet.type}
                  onChange={(e) => setNewPet({ ...newPet, type: e.target.value })}
                >
                  <option value="cat">🐱 Mèo</option>
                  <option value="dog">🐶 Chó</option>
                  <option value="rabbit">🐰 Thỏ</option>
                  <option value="bird">🐦 Chim</option>
                  <option value="fish">🐠 Cá</option>
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="btn-primary disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Đang tạo...' : 'Tạo Pet'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewPet({ name: '', type: 'cat' });
                    setError('');
                  }}
                  className="btn-secondary"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Pets Grid */}
        {pets.length === 0 ? (
          <div className="card text-center py-12">
            <span className="text-6xl">🐾</span>
            <h3 className="mt-4 text-lg font-medium text-gray-900">
              Chưa có thú cưng nào
            </h3>
            <p className="mt-2 text-gray-600">
              Hãy tạo thú cưng đầu tiên của bạn để bắt đầu chơi!
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 btn-primary"
            >
              Tạo Pet đầu tiên
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pets.map((pet) => (
              <PetCard
                key={pet._id}
                pet={pet}
                onPetUpdate={handlePetUpdate}
                onPetDelete={handlePetDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pets;
