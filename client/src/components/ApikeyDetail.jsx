import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const ApikeyDetail = ({ onClose }) => {
  const [formData, setFormData] = useState({
    apikey: '9e6ccc8c113929b266c2c81e1410f1b6',
    secret: '4x4mXdbXPV',
    accountName: 'HOTELBEDS SPAIN - PRUEBAS',
    environment: 'test',
    rateLimits: 'Empty',
    allowRequests: 8,
    perSeconds: 4,
    throttling: 'Empty',
    throttleInterval: -1,
    throttleRetryLimit: -1,
    usageQuotas: 'Empty',
    maxQuotas: 50,
    quotaResetsEvery: 86400,
    alias: ''
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await axios.get('/api/config/hotelbeds');
        if (data.success && data.config) {
          setFormData(prev => ({ ...prev, ...data.config }));
        }
      } catch (error) {
        console.error('Failed to fetch config', error);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const { data } = await axios.post('/api/config/hotelbeds', formData);
      if (data.success) {
        toast.success('Alias and config saved successfully!');
        if (onClose) onClose();
      } else {
        toast.error('Failed to save config.');
      }
    } catch (error) {
      toast.error('An error occurred while saving.');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 pb-2">
          <h2 className="text-2xl font-bold text-slate-900">Apikey detail</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold">
            &times;
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            
            {/* Row 1 */}
            <div>
              <label className="block text-gray-600 mb-1">Apikey</label>
              <input 
                type="text" 
                name="apikey"
                readOnly
                value={formData.apikey}
                className="w-full px-3 py-2 bg-gray-50 text-gray-600 rounded outline-none"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Secret</label>
              <input 
                type="text" 
                name="secret"
                readOnly
                value={formData.secret}
                className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded outline-none cursor-not-allowed"
              />
            </div>

            {/* Row 2 */}
            <div>
              <label className="block text-gray-600 mb-1">Account Name</label>
              <input 
                type="text" 
                name="accountName"
                readOnly
                value={formData.accountName}
                className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded outline-none cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-gray-600 mb-1">Environment</label>
              <input 
                type="text" 
                name="environment"
                readOnly
                value={formData.environment}
                className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded outline-none cursor-not-allowed"
              />
            </div>

            {/* Row 3 */}
            <div>
              <label className="block text-gray-600 mb-1">Rate Limits</label>
              <input 
                type="text" 
                name="rateLimits"
                readOnly
                value={formData.rateLimits}
                className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded outline-none cursor-not-allowed"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 mb-1">Allow number of requests</label>
                <input 
                  type="number" 
                  name="allowRequests"
                  readOnly
                  value={formData.allowRequests}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Per (seconds)</label>
                <input 
                  type="number" 
                  name="perSeconds"
                  readOnly
                  value={formData.perSeconds}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Row 4 */}
            <div>
              <label className="block text-gray-600 mb-1">Throttling</label>
              <input 
                type="text" 
                name="throttling"
                readOnly
                value={formData.throttling}
                className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded outline-none cursor-not-allowed"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 mb-1">Throttle interval</label>
                <input 
                  type="number" 
                  name="throttleInterval"
                  readOnly
                  value={formData.throttleInterval}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Throttle retry limit</label>
                <input 
                  type="number" 
                  name="throttleRetryLimit"
                  readOnly
                  value={formData.throttleRetryLimit}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Row 5 */}
            <div>
              <label className="block text-gray-600 mb-1">Usage Quotas</label>
              <input 
                type="text" 
                name="usageQuotas"
                readOnly
                value={formData.usageQuotas}
                className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded outline-none cursor-not-allowed"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 mb-1">Max Quotas</label>
                <input 
                  type="number" 
                  name="maxQuotas"
                  readOnly
                  value={formData.maxQuotas}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded outline-none cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-gray-600 mb-1">Quota resets every</label>
                <input 
                  type="number" 
                  name="quotaResetsEvery"
                  readOnly
                  value={formData.quotaResetsEvery}
                  className="w-full px-3 py-2 bg-gray-100 text-gray-600 rounded outline-none cursor-not-allowed"
                />
              </div>
            </div>

            {/* Row 6 */}
            <div className="md:col-span-2 mt-2">
              <label className="block text-gray-600 mb-1">Alias</label>
              <div className="flex gap-4 items-start">
                <input 
                  type="text" 
                  name="alias"
                  value={formData.alias}
                  onChange={handleChange}
                  className="flex-1 px-3 py-2 border border-gray-200 rounded text-gray-700 outline-none focus:border-blue-500"
                />
                <button 
                  onClick={handleSave}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
                >
                  Save Alias
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApikeyDetail;
