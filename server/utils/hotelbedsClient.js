import axios from 'axios';
import crypto from 'crypto';
import HotelbedsConfig from '../models/HotelbedsConfig.js';

/**
 * Hotelbeds API Client Utility
 * Uses the configuration stored in the database to authenticate and make requests.
 */
class HotelbedsClient {
  constructor() {
    this.baseUrl = 'https://api.test.hotelbeds.com/hotel-content-api/1.0';
  }

  async getConfig() {
    let config = await HotelbedsConfig.findOne();
    if (!config) {
      if (process.env.HOTELBEDS_API_KEY && process.env.HOTELBEDS_SECRET) {
        return {
          apikey: process.env.HOTELBEDS_API_KEY,
          secret: process.env.HOTELBEDS_SECRET
        };
      }
      throw new Error('Hotelbeds configuration not found in database or .env');
    }
    return config;
  }

  async getHeaders() {
    const config = await this.getConfig();
    
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

  async getHotels() {
    try {
      const headers = await this.getHeaders();
      const response = await axios.get(`${this.baseUrl}/hotels`, {
        headers,
        params: {
          fields: 'all',
          language: 'ENG',
          from: 1,
          to: 150
        }
      });
      return response.data;
    } catch (error) {
      console.error('Hotelbeds API Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

export default new HotelbedsClient();
