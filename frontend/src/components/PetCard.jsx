import React, { useState } from 'react';
import { deletePet, feedPet, playWithPet } from '../api/pets';
import { useToast } from '../context/ToastContext';

const PetCard = ({ pet, onPetUpdate, onPetDelete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();

  const handleFeed = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const response = await feedPet(pet._id);
      onPetUpdate(response.data.pet);
      
      // Enhanced toast with XP/coins info
      let toastMessage = response.message;
      if (response.data.leveledUp) {
        toastMessage += ` +${response.data.xpGained} XP, +${response.data.coinsGained} 💰`;
      } else {
        toastMessage += ` +${response.data.xpGained} XP, +${response.data.coinsGained} 💰`;
      }
      
      addToast(toastMessage, response.data.leveledUp ? 'success' : 'info');
    } catch (error) {
      console.error('Error feeding pet:', error);
      addToast('❌ Không thể cho pet ăn', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const response = await playWithPet(pet._id);
      onPetUpdate(response.data.pet);
      
      // Enhanced toast with XP/coins info
      let toastMessage = response.message;
      if (response.data.leveledUp) {
        toastMessage += ` +${response.data.xpGained} XP, +${response.data.coinsGained} 💰`;
      } else {
        toastMessage += ` +${response.data.xpGained} XP, +${response.data.coinsGained} 💰`;
      }
      
      addToast(toastMessage, response.data.leveledUp ? 'success' : 'info');
    } catch (error) {
      console.error('Error playing with pet:', error);
      addToast('❌ Không thể chơi với pet', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
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
  };

  const getStatusColor = (value) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

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
                      if (isLoading) return;
                      setIsLoading(true);
                      try {
                        const { message, pet: updatedPet } = await require('../api/pets').usePetAbility(pet._id, ability);
                        onPetUpdate(updatedPet);
                        addToast(`✨ ${ability}: ${message}`, 'success');
                      } catch (error) {
                        addToast(`❌ Không thể sử dụng kỹ năng: ${error.message || 'Lỗi'}`, 'error');
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
            {getPetTypeName(pet.type)} • {pet.coins || 0} 💰
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

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={handleFeed}
          disabled={isLoading}
          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors font-medium"
        >
          {isLoading ? '⏳' : '🍖'} Cho ăn
        </button>
        <button
          onClick={handlePlay}
          disabled={isLoading}
          className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-2 px-4 rounded-lg transition-colors font-medium"
        >
          {isLoading ? '⏳' : '🎾'} Chơi
        </button>
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
    </div>
  );
};

export default PetCard;
