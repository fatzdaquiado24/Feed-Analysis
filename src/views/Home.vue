<template>
  <v-app row>
    <v-toolbar fixed class="white">
      <v-toolbar-side-icon v-if="$vuetify.breakpoint.smAndDown" @click.stop="drawer = !drawer"/>
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

    <section>
      <v-container>
        <v-layout column wrap class="my-2" align-center>
          <v-flex xs12 class="my-3">
            <div class="text-xs-center">
              <h2 class="headline">Our Location</h2>
              <span class="subheading">Department of Agriculture</span>
            </div>
          </v-flex>
          <v-flex xs12 style="width:100%">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3925.3348376950994!2d123.88519731471949!3d10.315065170360427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a9994b05612cdf%3A0x43ae638feefe1187!2sDepartment+Of+Agriculture!5e0!3m2!1sen!2sph!4v1557480491116!5m2!1sen!2sph"
              height="450"
              frameborder="0"
              style="border:0;width:100%"
              allowfullscreen
            ></iframe>
          </v-flex>
        </v-layout>
      </v-container>
    </section>

    <v-footer dark height="auto">
      <v-card class="flex" flat tile>
        <v-card-title class="teal">
          <strong class="subheading">Start your feed chemical analysis now!</strong>
        </v-card-title>

        <v-card-actions class="grey darken-3 justify-center">
          &copy;2019
          <strong class="ml-2">DA Feed Chemical Analysis</strong>
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