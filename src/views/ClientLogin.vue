<template>
  <v-app row>
    <toast-container></toast-container>

    <v-layout>
      <v-flex class="background-cover" md12></v-flex>
      <v-flex xs12 d-flex align-center justify-center>
        <v-card class="elevation-4" max-width="400px">
          <v-card-title class="primary white--text py-4 title">Login</v-card-title>
          <v-card-text class="pb-0">
            <v-form @keyup.enter="login">
              <v-text-field prepend-icon="mail" v-model="email" label="Email Address" type="text" @keyup.enter="login" autofocus></v-text-field>
              <v-text-field prepend-icon="lock" v-model="password" label="Password" type="password" @keyup.enter="login"></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <router-link class="mr-2" :to="{name: 'ClientRegister'}">Not yet registered?</router-link>
            <v-btn small color="primary" @click="login" :loading="loading">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      email: '',
      password: '',
      loading: false
    }
  },
  mounted() {
		if(this.$store.state.successMessage) {
      this.$vueOnToast.pop('success', 'Success', this.$store.state.successMessage)
      this.$store.commit('unsetSuccessMessage')
		}
	},
  methods: {
    login() {
      if(!this.loading) {
        this.loading = true

        this.$store.dispatch('retrieveToken', {
          email: this.email,
          password: this.password,
          type: 'client'
        })
          .then(() => {
            this.$store.commit('setSuccessMessage', 'Login Successful')
            this.$router.push({ name: 'ClientLaboratoryAnalysis' })
          })
          .catch(error => {
            this.password = ''
            if(error.response && "errors" in error.response.data) {
              const errors = error.response.data.errors

              for(const messages of Object.values(errors)) {
                for(const message of messages) {
                  this.$vueOnToast.pop('error', 'Error', message)
                }
              }
            } else {
              this.$vueOnToast.pop('error', 'Error', error.response ? error.response.data.message : 'An Error Has Occurred')
            }
          })
          .finally(() => {
            this.loading = false
          })
      }
    }
  }
}
</script>

<style scoped>
  .background-cover {
    background: url('/images/background.jpg');
    background-size: cover;
    background-repeat: no-repeat;
    opacity: 0.6;
  }
</style>
