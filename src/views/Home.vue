<template>
  <v-app row>
    <v-toolbar fixed class="white">
      <v-toolbar-side-icon v-if="$vuetify.breakpoint.smAndDown" @click.stop="drawer = !drawer" />
      <v-toolbar-title>DA Feed Chemical Analysis</v-toolbar-title>
      <v-spacer></v-spacer>
      <div class="hidden-sm-and-down">
        <v-btn flat :to="{name: 'ClientRegister'}">Register</v-btn>
        <v-btn flat :to="{name: 'ClientLogin'}">Login</v-btn>
      </div>
    </v-toolbar>

    <v-navigation-drawer v-if="$vuetify.breakpoint.smAndDown" app v-model="drawer" width="250">
      <v-list>
        <v-list-tile :to="{name: 'ClientRegister'}">Register</v-list-tile>
        <v-list-tile :to="{name: 'ClientLogin'}">Login</v-list-tile>
      </v-list>
    </v-navigation-drawer>

    <section>
      <v-parallax src="/images/background.jpg" height="600" style="opacity:0.9">
        <v-layout column align-center justify-center class="white--text">
          <img src="/images/logo.png" alt="Department of Agriculture Logo">
          <div class="subheading mt-2">Department of Agriculture</div>
          <h1 class="white--text display-1">Feed Chemical Analysis</h1>
          <v-btn class="blue lighten-2 mt-2" dark large :to="{name: 'ClientLogin'}">Get Started</v-btn>
        </v-layout>
      </v-parallax>
    </section>

    Under development

    <v-footer dark height="auto">
      <v-card class="flex" flat tile>
        <v-card-title class="teal">
          <strong class="subheading">Start your feed chemical analysis now!</strong>
        </v-card-title>

        <v-card-actions class="grey darken-3 justify-center">
          &copy;2019<strong class="ml-2"> DA Feed Chemical Analysis</strong>
        </v-card-actions>
      </v-card>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      drawer: false
    };
  }
};
</script>