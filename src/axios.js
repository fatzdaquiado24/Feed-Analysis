window.axios = require('axios');
window.axios.defaults.baseURL = 'http://localhost/feed-analysis-api/public'
window.axios.defaults.headers.common = {'Accept': "application/json"}