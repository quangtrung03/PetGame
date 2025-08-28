import React, { useState, useEffect } from 'react';
import { getShopItems, buyItem, getUserInventory, useItem } from '../api/shop';
import { getPets } from '../api/pets';
import { useToast } from '../context/ToastContext';

const Shop = () => {
  const [shopItems, setShopItems] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [pets, setPets] = useState([]);
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [userCoins, setUserCoins] = useState(0);
  const { addToast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [shopData, inventoryData, petsData] = await Promise.all([
        getShopItems(),
        getUserInventory(),
        getPets()
      ]);
      
      setShopItems(shopData.data.items);
      setInventory(inventoryData.data.inventory);
      setPets(petsData.data.pets);
      
      // Get user coins from pets data (assuming we get it from user)
      if (petsData.data.pets.length > 0) {
        // We'll need to get user data separately or include it in pets response
        setUserCoins(100); // Placeholder, will fix this
      }
    } catch (error) {
      console.error('Error loading shop data:', error);
      addToast('❌ Không thể tải dữ liệu shop', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyItem = async (item) => {
    try {
      const response = await buyItem(item._id, 1);
      addToast(response.message, 'success');
      setUserCoins(response.data.userCoins);
      await loadData(); // Reload inventory
    } catch (error) {
      addToast(error.response?.data?.message || '❌ Không thể mua item', 'error');
    }
  };

  const handleUseItem = async (inventoryItem, petId = null) => {
    try {
      const response = await useItem(inventoryItem._id, petId);
      addToast(response.message, 'success');
      await loadData(); // Reload data
    } catch (error) {
      addToast(error.response?.data?.message || '❌ Không thể sử dụng item', 'error');
    }
  };

  const filteredItems = shopItems.filter(item => 
    selectedCategory === 'all' || item.category === selectedCategory
  );

  const categories = [
    { id: 'all', name: 'Tất cả', icon: '🛍️' },
    { id: 'basic', name: 'Cơ bản', icon: '📦' },
    { id: 'premium', name: 'Cao cấp', icon: '💎' },
    { id: 'special', name: 'Đặc biệt', icon: '⭐' }
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải shop...</p>
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
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              🏪 Pet Shop
            </h1>
            <p className="mt-2 text-gray-600 flex items-center gap-2">
              💰 Coins của bạn: <span className="font-bold text-yellow-600">{userCoins}</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('shop')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'shop'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🛒 Cửa hàng
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'inventory'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🎒 Kho đồ ({inventory.length})
          </button>
        </div>

        {/* Shop Tab */}
        {activeTab === 'shop' && (
          <div>
            {/* Category Filter */}
            <div className="flex space-x-2 mb-6 overflow-x-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.icon} {category.name}
                </button>
              ))}
            </div>

            {/* Shop Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredItems.map((item) => (
                <div key={item._id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="text-center mb-4">
                    <span className="text-4xl">{item.icon}</span>
                    <h3 className="text-lg font-bold text-gray-800 mt-2">{item.name}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>

                  {/* Effects */}
                  <div className="space-y-2 mb-4">
                    {item.effects.hunger > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>🍽️ Độ đói:</span>
                        <span className="text-green-600">+{item.effects.hunger}</span>
                      </div>
                    )}
                    {item.effects.happiness > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>😊 Độ vui:</span>
                        <span className="text-green-600">+{item.effects.happiness}</span>
                      </div>
                    )}
                    {item.effects.xp > 0 && (
                      <div className="flex justify-between text-sm">
                        <span>⭐ XP:</span>
                        <span className="text-purple-600">+{item.effects.xp}</span>
                      </div>
                    )}
                  </div>

                  {/* Price & Buy Button */}
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-yellow-600">
                      💰 {item.price}
                    </span>
                    <button
                      onClick={() => handleBuyItem(item)}
                      disabled={userCoins < item.price}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
                    >
                      {userCoins < item.price ? 'Không đủ coins' : 'Mua'}
                    </button>
                  </div>

                  {/* Pet Types */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Dành cho: {item.petTypes.includes('all') ? 'Tất cả pet' : item.petTypes.join(', ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <div>
            {inventory.length === 0 ? (
              <div className="text-center py-12">
                <span className="text-6xl">🎒</span>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  Kho đồ trống
                </h3>
                <p className="mt-2 text-gray-600">
                  Hãy mua items từ cửa hàng để bắt đầu!
                </p>
                <button
                  onClick={() => setActiveTab('shop')}
                  className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Đi mua sắm
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {inventory.map((inventoryItem) => (
                  <div key={inventoryItem._id} className="bg-white rounded-lg shadow-md p-6">
                    <div className="text-center mb-4">
                      <span className="text-4xl">{inventoryItem.item.icon}</span>
                      <h3 className="text-lg font-bold text-gray-800 mt-2">
                        {inventoryItem.item.name}
                      </h3>
                      <p className="text-sm text-gray-600">Số lượng: {inventoryItem.quantity}</p>
                    </div>

                    {/* Use Item Buttons */}
                    <div className="space-y-2">
                      <button
                        onClick={() => handleUseItem(inventoryItem)}
                        className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
                      >
                        ✨ Sử dụng ngay
                      </button>
                      
                      {pets.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-gray-500 text-center">Hoặc sử dụng cho pet:</p>
                          {pets.map((pet) => (
                            <button
                              key={pet._id}
                              onClick={() => handleUseItem(inventoryItem, pet._id)}
                              className="w-full px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm transition-colors"
                            >
                              {pet.type === 'cat' ? '🐱' : pet.type === 'dog' ? '🐶' : 
                               pet.type === 'rabbit' ? '🐰' : pet.type === 'bird' ? '🐦' : '🐠'} {pet.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
