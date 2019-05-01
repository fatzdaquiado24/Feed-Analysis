window.axios = require('axios');
window.axios.defaults.baseURL = 'https://feed-analysis-api.herokuapp.com/'
window.axios.defaults.headers.common = {'Accept': "application/json"}