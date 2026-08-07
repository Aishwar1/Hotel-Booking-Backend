import axios from 'axios';

class KosonClient {
  constructor() {
    this.defaultUrl = 'https://api.kosontechnology.com/india-hotel.php';
  }

  async getHotels() {
    try {
      const url = process.env.KOSON_HOTEL_API_URL || this.defaultUrl;
      const response = await axios.get(url);
      
      // If the API returns a string, try to parse it, otherwise return as is
      let data = response.data;
      if (typeof data === 'string') {
        data = JSON.parse(data);
      }
      
      return data;
    } catch (error) {
      console.error('Koson API Error:', error.message);
      throw error;
    }
  }
}

export default new KosonClient();
