import React, { useState, memo, useCallback } from 'react';
import { deletePet, feedPet, playWithPet, usePetAbility } from '../api/pets';
import { useToast } from '../context/ToastContext';
import { useEconomic } from '../context/EconomicContext';
import { useAuth } from '../context/AuthContext';
import ItemInventory from './ItemInventory';

const PetCard = memo(({ pet, onPetUpdate, onPetDelete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const { addToast } = useToast();
  const { cooldowns, refreshData } = useEconomic();
  const { updateUser } = useAuth();

  const handleFeed = useCallback(async () => {
    if (isLoading || !cooldowns?.feed?.canPerform) return;
    setIsLoading(true);
    
    try {
      const response = await feedPet(pet._id);
      // Backend trả về { success, message, data: { pet, user, coinsEarned, leveledUp } }
      onPetUpdate(response.data.data.pet);
      
      // Update user coins if received
      if (response.data.data.coinsEarned) {
        updateUser({ coins: response.data.data.user.coins });
      }
      
      // Enhanced toast with coins info
      addToast(response.data.message, response.data.data.leveledUp ? 'success' : 'info');
      refreshData(); // Refresh economic data
    } catch (error) {
      console.error('Error feeding pet:', error);
      addToast(error.response?.data?.message || '❌ Không thể cho pet ăn', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, cooldowns?.feed?.canPerform, pet._id, onPetUpdate, updateUser, addToast, refreshData]);

  const handlePlay = useCallback(async () => {
    if (isLoading || !cooldowns?.play?.canPerform) return;
    setIsLoading(true);
    
    try {
      const response = await playWithPet(pet._id);
      // Backend trả về { success, message, data: { pet, user, coinsEarned, leveledUp } }
      onPetUpdate(response.data.data.pet);
      
      // Update user coins if received
      if (response.data.data.coinsEarned) {
        updateUser({ coins: response.data.data.user.coins });
      }
      
      // Enhanced toast with coins info
      addToast(response.data.message, response.data.data.leveledUp ? 'success' : 'info');
      refreshData(); // Refresh economic data
    } catch (error) {
      console.error('Error playing with pet:', error);
      addToast(error.response?.data?.message || '❌ Không thể chơi với pet', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, cooldowns?.play?.canPerform, pet._id, onPetUpdate, updateUser, addToast, refreshData]);

  const handleDelete = useCallback(async () => {
    if (window.confirm(`Bạn có chắc muốn xóa ${pet.name}?`)) {
      try {
        await deletePet(pet._id);
        onPetDelete(pet._id);
        addToast(`😢 Đã xóa ${pet.name}`, 'info');
      } catch (error) {
        console.error('Error deleting pet:', error);
        addToast('❌ Không thể xóa pet', 'error');
      }
    }
  }, [pet._id, pet.name, onPetDelete, addToast]);

  const getStatusColor = useCallback((value) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  }, []);

  const getStatusText = (value) => {
    if (value >= 70) return 'Tốt';
    if (value >= 40) return 'Bình thường';
    return 'Cần chăm sóc';
  };

  const getPetIcon = (type) => {
    switch(type) {
      case 'cat': return '🐱';
      case 'dog': return '🐶';
      case 'rabbit': return '🐰';
      case 'bird': return '🐦';
      case 'fish': return '🐠';
      default: return '🐱';
    }
  };

  const getPetTypeName = (type) => {
    switch(type) {
      case 'cat': return 'Mèo';
      case 'dog': return 'Chó';
      case 'rabbit': return 'Thỏ';
      case 'bird': return 'Chim';
      case 'fish': return 'Cá';
      default: return 'Pet';
    }
  };

  // Calculate XP progress
  const xpForNextLevel = (pet.level || 1) * 100;
  const currentXP = pet.xp || 0;
  const xpProgress = (currentXP / xpForNextLevel) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            {getPetIcon(pet.type)} {pet.name}
            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Lv.{pet.level || 1}
            </span>
          </h3>
          {/* Hiển thị abilities */}
          {pet.abilities && pet.abilities.length > 0 && (
            <div className="mt-2">
              <span className="text-sm font-semibold text-gray-700">Kỹ năng đặc biệt:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {pet.abilities.map((ability) => (
                  <button
                    key={ability}
                    className="px-2 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-xs font-medium shadow-sm"
                    disabled={isLoading}
                    onClick={async () => {
                      if (isLoading || !cooldowns?.ability?.canPerform) return;
                      setIsLoading(true);
                      try {
                        const response = await usePetAbility(pet._id, ability);
                        onPetUpdate(response.data.pet);
                        
                        // Update user coins if received
                        if (response.data.coinsEarned) {
                          updateUser({ coins: response.data.user.coins });
                        }
                        
                        addToast(`✨ ${ability}: ${response.data.message}`, 'success');
                        refreshData(); // Refresh economic data
                      } catch (error) {
                        addToast(`❌ Không thể sử dụng kỹ năng: ${error.response?.data?.message || 'Lỗi'}`, 'error');
                      } finally {
                        setIsLoading(false);
                      }
                    }}
                  >{ability}</button>
                ))}
              </div>
            </div>
          )}
          <p className="text-sm text-gray-500">
            {getPetTypeName(pet.type)} • Cấp {pet.level || 1}
          </p>
        </div>
        <button
          onClick={handleDelete}
          className="text-red-500 hover:text-red-700 transition-colors"
          title="Xóa pet"
        >
          🗑️
        </button>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span>⭐ Kinh nghiệm</span>
          <span className="text-purple-600 font-medium">
            {currentXP}/{xpForNextLevel} XP
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full bg-purple-500 transition-all duration-300"
            style={{ width: `${Math.min(xpProgress, 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Status Bars */}
      <div className="space-y-3 mb-4">
        {/* Hunger Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>🍽️ Độ đói</span>
            <span className={`font-semibold ${pet.hunger < 40 ? 'text-red-600' : pet.hunger < 70 ? 'text-yellow-600' : 'text-green-600'}`}>
              {pet.hunger}/100 - {getStatusText(pet.hunger)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(pet.hunger)}`}
              style={{ width: `${pet.hunger}%` }}
            ></div>
          </div>
        </div>

        {/* Happiness Bar */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>😊 Độ vui</span>
            <span className={`font-semibold ${pet.happiness < 40 ? 'text-red-600' : pet.happiness < 70 ? 'text-yellow-600' : 'text-green-600'}`}>
              {pet.happiness}/100 - {getStatusText(pet.happiness)}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(pet.happiness)}`}
              style={{ width: `${pet.happiness}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Action Buttons với cooldown indicators */}
      <div className="space-y-2">
        {/* Cooldown status */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className={`text-center py-1 px-2 rounded ${cooldowns?.feed?.canPerform ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            🍖 {cooldowns?.feed?.canPerform ? 'Sẵn sàng' : `${cooldowns?.feed?.timeLeftMinutes || 0}m`}
          </div>
          <div className={`text-center py-1 px-2 rounded ${cooldowns?.play?.canPerform ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            🎾 {cooldowns?.play?.canPerform ? 'Sẵn sàng' : `${cooldowns?.play?.timeLeftMinutes || 0}m`}
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={handleFeed}
            disabled={isLoading || !cooldowns?.feed?.canPerform}
            className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-3 rounded-lg transition-colors font-medium text-sm"
            title={!cooldowns?.feed?.canPerform ? `Còn ${cooldowns?.feed?.timeLeftMinutes || 0} phút` : ''}
          >
            {isLoading ? '⏳' : '🍖'} Cho ăn
          </button>
          <button
            onClick={handlePlay}
            disabled={isLoading || !cooldowns?.play?.canPerform}
            className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-3 rounded-lg transition-colors font-medium text-sm"
            title={!cooldowns?.play?.canPerform ? `Còn ${cooldowns?.play?.timeLeftMinutes || 0} phút` : ''}
          >
            {isLoading ? '⏳' : '🎾'} Chơi
          </button>
          <button
            onClick={() => setShowInventory(true)}
            disabled={isLoading}
            className="bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white py-2 px-3 rounded-lg transition-colors font-medium text-sm"
          >
            🎒 Túi đồ
          </button>
        </div>
      </div>

      {/* Pet Info Footer */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Tạo: {new Date(pet.createdAt).toLocaleDateString('vi-VN')}</span>
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${
              (pet.hunger + pet.happiness) / 2 >= 70 ? 'bg-green-400' :
              (pet.hunger + pet.happiness) / 2 >= 40 ? 'bg-yellow-400' : 'bg-red-400'
            }`}></span>
            {(pet.hunger + pet.happiness) / 2 >= 70 ? 'Khỏe mạnh' :
             (pet.hunger + pet.happiness) / 2 >= 40 ? 'Bình thường' : 'Cần chăm sóc'}
          </span>
        </div>
      </div>

      {/* Item Inventory Modal */}
      <ItemInventory
        petId={pet._id}
        petName={pet.name}
        petType={pet.type}
        isOpen={showInventory}
        onClose={() => setShowInventory(false)}
        onPetUpdate={onPetUpdate}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for React.memo
  return (
    prevProps.pet._id === nextProps.pet._id &&
    prevProps.pet.happiness === nextProps.pet.happiness &&
    prevProps.pet.hunger === nextProps.pet.hunger &&
    prevProps.pet.health === nextProps.pet.health &&
    prevProps.pet.level === nextProps.pet.level &&
    prevProps.pet.xp === nextProps.pet.xp
  );
});

export default PetCard;
