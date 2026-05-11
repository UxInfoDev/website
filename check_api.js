const axios = require('axios');

async function check() {
  try {
    const res = await axios.get('http://localhost:5000/api/services');
    console.log('API_RESPONSE:' + JSON.stringify(res.data.slice(0, 1)));
  } catch (err) {
    console.error('API Error:', err.message);
  }
}
check();
