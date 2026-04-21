import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { formatPriceDT } from '../utils/formatPrice';

const ApiTest = () => {
  const [apiStatus, setApiStatus] = useState('Testing...');
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    testApiConnection();
  }, []);

  const testApiConnection = async () => {
    try {
      setApiStatus('Testing backend connection...');
      
      // Test health endpoint
      const healthResponse = await api.get('/health');
      console.log('Health check:', healthResponse.data);
      setApiStatus('✅ Backend connected');
      
      // Test categories
      const categoriesResponse = await api.get('/categories');
      console.log('Categories:', categoriesResponse.data);
      setCategories(categoriesResponse.data);
      
      // Test menu items
      const menuResponse = await api.get('/menu-items');
      console.log('Menu items:', menuResponse.data);
      setMenuItems(menuResponse.data);
      
    } catch (err) {
      console.error('API Test error:', err);
      setError(err.message);
      setApiStatus('❌ Backend connection failed');
    }
  };

  return (
    <div className="p-8 bg-white rounded-lg shadow-lg max-w-2xl mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-6">API Connection Test</h2>
      
      <div className="space-y-4">
        <div>
          <strong>Status:</strong> {apiStatus}
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div>
          <strong>Categories ({categories.length}):</strong>
          <ul className="list-disc list-inside ml-4 mt-2">
            {categories.map(cat => (
              <li key={cat.id}>{cat.name}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <strong>Menu Items ({menuItems.length}):</strong>
          <ul className="list-disc list-inside ml-4 mt-2">
            {menuItems.slice(0, 5).map(item => (
              <li key={item.id}>{item.name} - {formatPriceDT(item.price)}</li>
            ))}
          </ul>
        </div>
        
        <button 
          onClick={testApiConnection}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Retest Connection
        </button>
      </div>
    </div>
  );
};

export default ApiTest;