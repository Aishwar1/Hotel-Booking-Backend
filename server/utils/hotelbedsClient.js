import axios from 'axios';
import crypto from 'crypto';
import HotelbedsConfig from '../models/HotelbedsConfig.js';

/**
 * Hotelbeds API Client Utility
 * Uses the configuration stored in the database to authenticate and make requests.
 */
class HotelbedsClient {
  constructor() {
    this.baseUrl = 'https://api.test.hotelbeds.com/hotel-api/1.0'; // Default to test
  }

  async getConfig() {
    let config = await HotelbedsConfig.findOne();
    if (!config) {
      throw new Error('Hotelbeds configuration not found in database.');
    }
    return config;
  }

  async getHeaders() {
    const config = await this.getConfig();
    
    // Hotelbeds API requires a signature: SHA256(apiKey + secret + timestamp)
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const signature = crypto
      .createHash('sha256')
      .update(config.apikey + config.secret + timestamp)
      .digest('hex');

    return {
      'Api-key': config.apikey,
      'X-Signature': signature,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
  }

  async getHotels(destinationCode) {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.baseUrl}/hotels`, {
        headers,
        params: {
          destinationCode
        }
      });
      return response.data;
    } catch (error) {
      console.error('Hotelbeds API Error:', error.response?.data || error.message);
      throw error;
    }
  }

  // Add more methods here as needed for "real time database" integration
}

export default new HotelbedsClient();
