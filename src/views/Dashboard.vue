<template>
	<v-app>
		<toast-container :toastConfig="{ positionClass: 'vot-bottom-left' }"></toast-container>
		
		<v-navigation-drawer
				:clipped="$vuetify.breakpoint.lgAndUp"
				fixed
				app
				v-model="drawer"
				width="250"
			>
			<v-list>
				<v-list-tile v-for="(item, index) in items[$store.getters.loginType]" :key="index" :to="{name: item.route}">
					<v-list-tile-action>
						<v-icon>{{ item.icon }}</v-icon>
					</v-list-tile-action>
					<v-list-tile-content>
						<v-list-tile-title>
							{{ item.text }}
						</v-list-tile-title>
					</v-list-tile-content>
				</v-list-tile>
			</v-list>
		</v-navigation-drawer>

		<v-toolbar
			clipped-left
			color="primary"
			dark
			app
			fixed
		>
			<v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
			<v-toolbar-title>BFP Fire Alarm System</v-toolbar-title>
			<v-spacer></v-spacer>
			<span class="hidden-xs-only text-capitalize">Welcome {{ $store.getters.loginType }}</span>
			<v-toolbar-items dense>
				<v-menu offset-y left>
					<v-btn slot="activator" flat icon>
						<v-icon class="hidden-xs-only">arrow_drop_down</v-icon>
						<v-icon class="hidden-sm-and-up">more_vert</v-icon>
					</v-btn>
					<v-list dense>
						<v-list-tile @click="logout">
							<v-list-tile-action>
								<v-icon>exit_to_app</v-icon>
							</v-list-tile-action>
							<v-list-tile-content>
								<v-list-tile-title>Sign Out</v-list-tile-title>
							</v-list-tile-content>
						</v-list-tile>
					</v-list>
				</v-menu>
			</v-toolbar-items>
		</v-toolbar>

		<v-content>
			<v-container fluid>
				<router-view></router-view>
			</v-container>
		</v-content>
	</v-app>
</template>

<script>
export default {
	data() {
		return {
			drawer: null,
			items: {
				'client': [
					{ icon: 'open_in_new', text: 'Laboratory Analysis', route: 'ClientLaboratoryAnalysis' },
				],
				'head manager': [
					{ icon: 'account_circle', text: 'Clients', route: 'HeadManagerClients' },
					{ icon: 'reply', text: 'Receivers', route: 'HeadManagerReceivers' },
					{ icon: 'assignment_ind', text: 'Chemists', route: 'HeadManagerChemists' },
					{ icon: 'event_notes', text: 'Appointment Dates', route: 'HeadManagerAppointmentDates' },
					{ icon: 'sort', text: 'Chemical Tests', route: 'HeadManagerChemicalTests' },
				],
			}
		}
	},
	created() {
		const token = localStorage.getItem('access_token')
		if (token) {
			window.axios.defaults.headers.common['Authorization'] = 'Bearer ' + token
		}
	},
	mounted() {
		if(this.$store.state.successMessage) {
			this.$vueOnToast.pop('success', 'Success', this.$store.state.successMessage)
			this.$store.commit('unsetSuccessMessage')
		}
	},
	methods: {
		logout() {
			const logoutRoute = this.$store.getters.loginType == 'client' ? 'ClientLogin' : 'HeadManagerLogin'
			this.$store.dispatch('destroyToken')
				.then(response => {
					this.$store.commit('setSuccessMessage', response.data.message)
				})
				.catch(() => {
					this.$store.commit('setSuccessMessage', 'Logout Successful')
				})
				.finally(() => {
					this.$router.push({ name: logoutRoute })
				})
		}
	}
}
</script>