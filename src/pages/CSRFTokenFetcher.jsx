// CSRFTokenFetcher.jsx
import { useEffect } from 'react';
import axios from 'axios';

const CSRFTokenFetcher = () => {
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await axios.get('/api/get-csrf-token'); // ปรับ URL ตาม backend ของคุณ
        const csrfToken = response.data.csrfToken;
        axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };

    fetchCsrfToken();
  }, []);

  return null; // ไม่มีการแสดงผล UI
};

export default CSRFTokenFetcher;
