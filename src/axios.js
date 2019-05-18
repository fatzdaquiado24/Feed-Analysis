window.axios = require('axios');
window.axios.defaults.baseURL = 'http://feed-analysis-api.herokuapp.com/'
window.axios.defaults.headers.common = {'Accept': "application/json"}