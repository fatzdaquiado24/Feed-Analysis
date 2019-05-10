<template>
  <div>
    <v-layout class="mb-3" align-center>
      <h1 class="headline font-weight-medium">File a Complaint</h1>
    </v-layout>

    <v-card>
      <v-card-title class="grey lighten-4 py-4 title">Got a complaint?</v-card-title>
      <v-progress-linear class="my-0" :indeterminate="true" height="3" :active="loading"></v-progress-linear>
      <v-form @submit.prevent>
        <div grid-list-sm class="pt-4 px-4">
          <v-textarea
            v-model="data.description"
            :error-messages="errors.collect('description')"
            v-validate="'required'"
            data-vv-name="description"
            data-vv-as="complaint description"
            box
            label="Complaint description"
          ></v-textarea>
        </div>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat @click="submitComplaint" :loading="loading">Submit</v-btn>
        </v-card-actions>
      </v-form>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      data: {}
    };
  },
  methods: {
    submitComplaint() {
      if (!this.loading) {
        this.$validator.validateAll().then(result => {
          if (result) {
            this.loading = true;

            window.axios
              .post("/complaints", this.data)
              .then(response => {
                this.$vueOnToast.pop(
                  "success",
                  "Success",
                  response.data.message
                );
                this.data = {}
              })
              .catch(error => {
                if (error.response && "errors" in error.response.data) {
                  const errors = error.response.data.errors;

                  for (const messages of Object.values(errors)) {
                    for (const message of messages) {
                      this.$vueOnToast.pop("error", "Error", message);
                    }
                  }
                } else {
                  this.$vueOnToast.pop(
                    "error",
                    "Error",
                    error.response
                      ? error.response.data.message
                      : "An Error Has Occurred"
                  );
                }
              })
              .finally(() => {
                this.loading = false;
              });
          }
        });
      }
    }
  }
};
</script>