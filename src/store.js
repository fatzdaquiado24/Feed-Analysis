import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    successMessage: null,
		token: localStorage.getItem('access_token') || null,
		loginType: localStorage.getItem('login_type') || null
  },
  getters: {
    loggedIn(state) {
		return state.token !== null
	},
	loginType(state) {
		return state.loginType
	}
  },
  mutations: {
    setSuccessMessage(state, message) {
			state.successMessage = message
		},
		unsetSuccessMessage(state) {
			state.successMessage = null
		},
    retrieveToken(state, token) {
			state.token = token
		},
		destroyToken(state) {
			state.token = null
		},
		setLoginType(state, loginType) {
			state.loginType = loginType
		},
		unsetLoginType(state) {
			state.loginType = null
		}
  },
  actions: {
    retrieveToken(context, credentials) {
			return new Promise((resolve, reject) => {
				window.axios.post('/login', credentials)
					.then(response => {
						const token = response.data.access_token

						localStorage.setItem('access_token', token)
						context.commit('retrieveToken', token)
						localStorage.setItem('login_type', credentials.type)
						context.commit('setLoginType', credentials.type)
						resolve(response)
					})
					.catch(error => {
						reject(error)
					})
			})
		},
		destroyToken(context) {
			if(context.getters.loggedIn) {
				return new Promise((resolve, reject) => {
					window.axios.post('/logout')
						.then(response => {
							localStorage.removeItem('access_token')
							context.commit('destroyToken')
							localStorage.removeItem('login_type')
							context.commit('unsetLoginType')
							resolve(response)
						})
						.catch(error => {
							localStorage.removeItem('access_token')
							context.commit('destroyToken')
							localStorage.removeItem('login_type')
							context.commit('unsetLoginType')
							reject(error)
						})
				})
			}
		}
  }
})
