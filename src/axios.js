window.axios = require('axios');
window.axios.defaults.baseURL = 'http://fire-alarm-api.herokuapp.com'
window.axios.defaults.headers.common = {'Accept': "application/json"}