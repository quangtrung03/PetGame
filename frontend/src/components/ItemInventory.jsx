import React, { useState, useEffect } from 'react';
import { getUserInventory, useItem } from '../api/shop';
import { useToast } from '../context/ToastContext';

const ItemInventory = ({ petId, petName, petType, isOpen, onClose, onPetUpdate }) => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usingItem, setUsingItem] = useState(null);
  const { addToast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchInventory();
    }
  }, [isOpen]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await getUserInventory();
      setInventory(response.data.inventory || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      addToast('❌ Không thể tải túi đồ', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUseItem = async (inventoryItem) => {
    if (usingItem) return;
    
    try {
      setUsingItem(inventoryItem._id);
      const response = await useItem(inventoryItem._id, petId);
      
      // Update pet data
      if (response.data.pet && onPetUpdate) {
        onPetUpdate(response.data.pet);
      }
      
      // Refresh inventory
      await fetchInventory();
      
  addToast(response.data.message, 'success');
    } catch (error) {
      console.error('Error using item:', error);
      addToast(error.response?.data?.message || '❌ Không thể sử dụng vật phẩm', 'error');
    } finally {
      setUsingItem(null);
    }
  };

  const getItemIcon = (type) => {
    switch (type) {
      case 'food': return '🍖';
      case 'toy': return '🎾';
      case 'accessory': return '👑';
      default: return '📦';
    }
  };

  const getEffectText = (effects) => {
    const effectTexts = [];
    if (effects.hunger > 0) effectTexts.push(`+${effects.hunger} đói`);
    if (effects.happiness > 0) effectTexts.push(`+${effects.happiness} vui`);
    if (effects.xp > 0) effectTexts.push(`+${effects.xp} XP`);
    return effectTexts.join(', ');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">🎒 Túi đồ cho {petName}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải túi đồ...</p>
          </div>
        ) : inventory.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Túi đồ trống</p>
            <p className="text-sm text-gray-500 mt-2">
              Hãy mua vật phẩm từ cửa hàng để sử dụng!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {inventory.map((inventoryItem) => {
              const item = inventoryItem.item;
              const isUsing = usingItem === inventoryItem._id;
              const canUse = !item.petTypes?.length || 
                           item.petTypes.includes('all') || 
                           item.petTypes.includes(petType);

              return (
                <div
                  key={inventoryItem._id}
                  className={`border rounded-lg p-3 ${canUse ? 'border-gray-200' : 'border-red-200 bg-red-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getItemIcon(item.type)}</span>
                      <div>
                        <h3 className="font-semibold">{item.name}</h3>
                        <p className="text-sm text-gray-600">
                          {getEffectText(item.effects)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Số lượng: {inventoryItem.quantity}
                        </p>
                      </div>
                    </div>
                    
                    {canUse ? (
                      <button
                        onClick={() => handleUseItem(inventoryItem)}
                        disabled={isUsing}
                        className={`px-3 py-1 rounded text-sm font-medium ${
                          isUsing
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        }`}
                      >
                        {isUsing ? '⏳' : '✨ Dùng'}
                      </button>
                    ) : (
                      <span className="text-xs text-red-500 px-2">
                        Không phù hợp
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemInventory;
