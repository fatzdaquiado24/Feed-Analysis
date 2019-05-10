<template>
  <div>
    <v-layout class="mb-3" align-center>
      <h1 class="headline font-weight-medium">Customer Feedback</h1>
    </v-layout>

    <v-card>
      <v-card-title class="headline pb-0" primary-title>Rate Us</v-card-title>
      <template v-if="!initializing">
        <v-card-text>
          Please take a few seconds to rate your experience with us. It really helps!
          <v-form @submit.prevent>
            <v-rating
              v-model="data.rating"
              class="text-xs-center"
              color="yellow darken-3"
              background-color="grey darken-1"
              hover
            ></v-rating>
            <v-textarea v-model="data.comment" box label="Comments or Suggestions (Optional)"></v-textarea>
          </v-form>
        </v-card-text>
        <v-divider></v-divider>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            flat
            @click="submitFeedback"
            :loading="loading"
          >{{ this.mode == 'create' ? 'Rate Now' : 'Update Rating'}}</v-btn>
        </v-card-actions>
      </template>
      <v-container v-else class="text-xs-center">
        <v-progress-circular :size="50" color="primary" indeterminate/>
      </v-container>
    </v-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      initializing: true,
      loading: false,
      data: {},
      updateId: null,
      mode: null
    };
  },
  created() {
    window.axios
      .get("/customer-feedbacks")
      .then(response => {
        if (this.isEmpty(response.data)) {
          this.mode = "create";
        } else {
          this.mode = "update";
          this.data = {
            rating: response.data.rating,
            comment: response.data.comment
          };
          this.updateId = response.data.id;
        }
        this.initializing = false;
      })
      .catch(error => {
        this.$vueOnToast.pop(
          "error",
          "Error",
          error.response ? error.response.data.message : "An Error Has Occurred"
        );
      });
  },
  computed: {
    submitData() {
      if (this.data.comment == undefined || this.data.comment == "") {
        return Object.assign({}, this.data, {
          comment: null
        });
      } else {
        return this.data
      }
    }
  },
  methods: {
    refresh() {
      this.loading = false;
      this.initializing = true;
      this.data = {};
      this.updateId = null;
      this.mode = null;

      window.axios
        .get("/customer-feedbacks")
        .then(response => {
          if (this.isEmpty(response.data)) {
            this.mode = "create";
          } else {
            this.mode = "update";
            this.data = {
              rating: response.data.rating,
              comment: response.data.comment
            };
            this.updateId = response.data.id;
          }
          this.initializing = false;
        })
        .catch(error => {
          this.$vueOnToast.pop(
            "error",
            "Error",
            error.response
              ? error.response.data.message
              : "An Error Has Occurred"
          );
        });
    },
    isEmpty(object) {
      for (let key in object) {
        if (object.hasOwnProperty(key)) return false;
      }
      return true;
    },
    submitFeedback() {
      if (!this.loading) {
        if (this.mode == "create") {
          this.loading = true;

          window.axios
            .post("/customer-feedbacks", this.submitData)
            .then(response => {
              this.$vueOnToast.pop("success", "Success", response.data.message);
              this.refresh();
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
        } else if (this.mode == "update") {
          this.loading = true;

          window.axios
            .put(`/customer-feedbacks/${this.updateId}`, this.submitData)
            .then(response => {
              this.$vueOnToast.pop("success", "Success", response.data.message);
              this.refresh();
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
      }
    }
  }
};
</script>