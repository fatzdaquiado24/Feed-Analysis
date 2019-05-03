<template>
  <div>
    <v-layout class="mb-3" align-center>
      <h1 class="headline font-weight-medium">Appointment Dates</h1>
      <v-spacer></v-spacer>
      <v-btn small class="ma-0" color="teal" dark @click="refresh">Refresh</v-btn>
    </v-layout>

    <v-card class="mb-3">
      <v-card-title class="grey lighten-4 py-4 title"></v-card-title>
      <v-container class="text-xs-center">
        <v-layout v-if="!loading" wrap>
          <v-flex sm6 xs12 class="text-sm-left text-xs-center">
            <v-btn @click="$refs.calendar.prev()">
              <v-icon dark left>keyboard_arrow_left</v-icon>Prev
            </v-btn>
          </v-flex>
          <v-flex sm6 xs12 class="text-sm-right text-xs-center">
            <v-btn @click="$refs.calendar.next()">
              Next
              <v-icon right dark>keyboard_arrow_right</v-icon>
            </v-btn>
          </v-flex>
          <v-flex xs12 class="mt-3">
            <v-sheet height="400">
              <v-calendar
                v-model="start"
                ref="calendar"
                type="month"
                color="blue"
                @click:day="onCalendarDayClick"
              >
                <template v-slot:day="{ date }">
                  <template v-if="appointmentDate(date)">
                    <div class="hidden-md-and-down">
                      <div
                        class="ma-1 primary "
                      >Appointed: {{appointmentDate(date).appointed}}</div>

                      <div
                        class="ma-1 primary"
                      >Max appointments: {{appointmentDate(date).maximum_appointment}}</div>
                    </div>

                    <div
                      class="ma-1 primary hidden-lg-and-up"
                      >{{ `${appointmentDate(date).appointed}/${appointmentDate(date).maximum_appointment}` }}</div>
                  </template>
                </template>
              </v-calendar>
            </v-sheet>
          </v-flex>
        </v-layout>
        <v-progress-circular v-else :size="50" color="primary" indeterminate/>
      </v-container>
    </v-card>

    <v-dialog v-model="dialog" width="800px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">{{ this.mode }} record</v-card-title>
        <v-progress-linear class="my-0" :indeterminate="true" height="3" :active="submitting"></v-progress-linear>
        <form @submit.prevent>
          <v-container grid-list-sm class="pa-4">
            <v-text-field
              v-model="data.maximum_appointment"
              mask="###"
              maxlength="3"
              :error-messages="errors.collect('maximum_appointment')"
              v-validate="'required|min_value:0|max_value:999'"
              data-vv-name="maximum_appointment"
              data-vv-as="maximum appointments"
              key="maximum_appointment"
              label="Maximum Appointments"
              prepend-icon="view_compact"
              @keyup.enter="onFormSubmit"
            ></v-text-field>
          </v-container>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="dialog = false">Cancel</v-btn>
            <v-btn flat @click="onFormSubmit" :submitting="submitting">{{ this.mode }}</v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      type: "month",
      start: new Date().toISOString(),
      appointmentDates: null,
      data: {},
      mode: null,
      updateId: null,
      loading: true,
      submitting: false,
      dialog: false
    };
  },
  created() {
    window.axios
      .get("/appointment-dates")
      .then(response => {
        this.appointmentDates = response.data;
      })
      .catch(error => {
        this.$vueOnToast.pop(
          "error",
          "Error",
          error.response ? error.response.data.message : "An Error Has Occurred"
        );
      })
      .finally(() => {
        this.loading = false;
      });
  },
  methods: {
    refresh() {
      this.items = [];
      this.loading = true;

      window.axios
        .get("/appointment-dates")
        .then(response => {
          this.appointmentDates = response.data;
        })
        .catch(error => {
          this.$vueOnToast.pop(
            "error",
            "Error",
            error.response
              ? error.response.data.message
              : "An Error Has Occurred"
          );
        })
        .finally(() => {
          this.loading = false;
        });
    },
    appointmentDate(date) {
      return this.appointmentDates.find(appointmentDate => appointmentDate.date == date)
    },
    onCalendarDayClick(date) {
      const appointmentDate = this.appointmentDates.find(
        record => record.date == date.date
      );
      if (appointmentDate == undefined) {
        this.mode = "Create";
        this.data = {
          date: date.date,
          maximum_appointment: ""
        };
      } else {
        this.mode = "Update";
        this.data = {
          maximum_appointment: appointmentDate.maximum_appointment
        };
        this.updateId = appointmentDate.id;
      }
      this.$validator.reset();
      this.dialog = true;
    },
    onFormSubmit() {
      if (!this.submitting && this.dialog) {
        this.$validator.validateAll().then(result => {
          if (result) {
            this.submitting = true;

            if (this.mode == "Create") {
              window.axios
                .post("/appointment-dates", this.data)
                .then(response => {
                  this.dialog = false;
                  this.$vueOnToast.pop(
                    "success",
                    "Success",
                    response.data.message
                  );
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
                  this.submitting = false;
                });
            } else if (this.mode == "Update") {
              window.axios
                .put(`/appointment-dates/${this.updateId}`, this.data)
                .then(response => {
                  this.dialog = false;
                  this.$vueOnToast.pop(
                    "success",
                    "Success",
                    response.data.message
                  );
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
                  this.submitting = false;
                });
            }
          }
        });
      }
    }
  }
};
</script>
