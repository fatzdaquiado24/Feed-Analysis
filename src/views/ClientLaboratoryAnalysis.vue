<template>
  <div>
    <v-layout class="mb-3" align-center>
      <h1 class="headline font-weight-medium">Request for Laboratory Analysis</h1>
    </v-layout>

    <v-stepper v-model="step" vertical>
      <v-stepper-step :complete="step > 1" step="1">Select Analysis Requests</v-stepper-step>

      <v-stepper-content step="1">
        <form data-vv-scope="analysis_form" @submit.prevent>
          <v-card v-for="(item, i) in data.feed_analysis_tests.length" :key="i" class="mb-4" tile>
            <v-card-title class="grey darken-3 white--text">Feed Analysis Test # {{ item }}</v-card-title>
            <div class="pa-3">
              <v-text-field
                v-model="data.feed_analysis_tests[i].sample_name"
                :error-messages="errors.collect(`analysis_form.feed_analysis_tests[${i}].sample_name`)"
                v-validate="'required'"
                :data-vv-name="`feed_analysis_tests[${i}].sample_name`"
                data-vv-as="name of sample"
                :key="`analysis_form.feed_analysis_tests[${i}].sample_name`"
                label="Name of Sample"
                prepend-icon="contact_support"
                @keyup.enter="createLaboratoryAnalysis"
              ></v-text-field>

              <v-select
                v-model="data.feed_analysis_tests[i].analysis_requests"
                :error-messages="errors.collect(`analysis_form.feed_analysis_tests[${i}].analysis_requests`)"
                v-validate="'required'"
                :data-vv-name="`feed_analysis_tests[${i}].analysis_requests`"
                data-vv-as="analysis requests"
                :key="`analysis_form.feed_analysis_tests[${i}].analysis_requests`"
                :items="chemicalTests"
                prepend-icon="assignment"
                label="Analysis Requests"
                chips
                multiple
                :hint="subtotalFee(i)"
                persistent-hint
              ></v-select>
            </div>
          </v-card>

          <v-card-actions class="py-0">
            {{ totalFee }}
            <v-spacer></v-spacer>
            <v-btn small class="ma-0" color="primary" @click="addRequest">Add</v-btn>
            <v-btn
              small
              class="ma-0 ml-2"
              color="error"
              @click="removeLastRequest"
              v-if="data.feed_analysis_tests.length > 1"
            >Remove Last</v-btn>
          </v-card-actions>
        </form>

        <v-btn color="primary" @click="submitAnalysisForm">Continue</v-btn>
      </v-stepper-content>

      <v-stepper-step :complete="step > 2" step="2">
        Select Appointment Date
        <small>(Select the date to deliver the samples to DA office)</small>
      </v-stepper-step>

      <v-stepper-content step="2">
        <v-layout v-if="!loading" wrap>
          <v-flex xs6 class="text-sm-left text-xs-center">
            <v-btn @click="$refs.calendar.prev()">
              <v-icon dark left>keyboard_arrow_left</v-icon>Prev
            </v-btn>
          </v-flex>
          <v-flex xs6 class="text-sm-right text-xs-center">
            <v-btn @click="$refs.calendar.next()">
              Next
              <v-icon right dark>keyboard_arrow_right</v-icon>
            </v-btn>
          </v-flex>
          <v-flex xs12 class="mt-3">
            <v-sheet v-if="appointmentDates" height="400" class="mb-3">
              <v-calendar
                v-model="selectedDate"
                class="text-xs-center"
                ref="calendar"
                type="month"
                color="blue"
                @click:day="onCalendarDayClick"
              >
                <template v-slot:day="{ date }">
                  <template v-if="appointmentDate(date)">
                    <div class="hidden-md-and-down">
                      <div class="ma-1 primary">Appointed: {{appointmentDate(date).appointed}}</div>

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

            <form data-vv-scope="appointment_date_form" @submit.prevent>
              <v-text-field
                v-model="selectedDate"
                :error-messages="errors.collect(`appointment_date_form.appointment_date`)"
                v-validate="'required'"
                data-vv-name="appointment_date"
                data-vv-as="appointment date"
                label="Appointment Date"
                prepend-icon="calendar_today"
                readonly
              ></v-text-field>
            </form>
          </v-flex>
        </v-layout>
        <v-btn color="primary" @click="createLaboratoryAnalysisRequest" :loading="creating">Submit</v-btn>
        <v-btn @click="step = 1">Go Back</v-btn>
      </v-stepper-content>
    </v-stepper>
  </div>
</template>

<script>
export default {
  data() {
    return {
      type: "month",
      appointmentDates: null,
      step: 1,
      data: {
        feed_analysis_tests: [
          {
            sample_name: null,
            analysis_requests: null
          }
        ]
      },
      loading: null,
      chemicalTests: [],
      selectedDate: "",
      creating: false
    };
  },
  created() {
    window.axios
      .get("/chemical-tests")
      .then(response => {
        this.chemicalTests = response.data.map(object => {
          var newObject = {};
          newObject["value"] = object.id;
          newObject["text"] = `${object.parameter} - Php ${object.fee}`;
          newObject["fee"] = object.fee;
          return newObject;
        });
        return window.axios.get("/appointment-dates");
      })
      .then(response => {
        this.appointmentDates = response.data;
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
    totalFee() {
      const fee = this.data.feed_analysis_tests
        .reduce((total, currentValue) => {
          if (currentValue.analysis_requests == undefined) return total;

          return (
            total +
            currentValue.analysis_requests.reduce((total, currentValue) => {
              return (
                total +
                Number(
                  this.chemicalTests.find(
                    object => object.value == currentValue
                  ).fee
                )
              );
            }, 0)
          );
        }, 0)
        .toFixed(2);
      return `Total Fee: Php ${fee}`;
    }
  },
  methods: {
    onCalendarDayClick(date) {
      this.data.appointment_date = this.selectedDate = date.date;
      this.$vueOnToast.pop("success", "Selected");
    },
    appointmentDate(date) {
      return this.appointmentDates.find(
        appointmentDate => appointmentDate.date == date
      );
    },
    subtotalFee(index) {
      if (this.data.feed_analysis_tests[index].analysis_requests == undefined)
        return "";

      const fee = this.data.feed_analysis_tests[index].analysis_requests
        .reduce((total, currentValue) => {
          return (
            total +
            Number(
              this.chemicalTests.find(object => object.value == currentValue)
                .fee
            )
          );
        }, 0)
        .toFixed(2);
      return `Total: Php ${fee}`;
    },
    addRequest() {
      this.data.feed_analysis_tests.push({
        sample_name: null,
        analysis_requests: null
      });
    },
    removeLastRequest() {
      this.data.feed_analysis_tests.pop();
    },
    submitAnalysisForm() {
      this.$validator.validateAll("analysis_form").then(result => {
        if (result) {
          this.step = 2;
        }
      });
    },
    createLaboratoryAnalysisRequest() {
      if (!this.creating) {
        this.$validator.validateAll("appointment_date_form").then(result => {
          if (result) {
            this.creating = true;

            window.axios
              .post("/laboratory-analysis-requests", this.data)
              .then(response => {
                this.data = {
                  feed_analysis_tests: [
                    {
                      sample_name: null,
                      analysis_requests: null
                    }
                  ]
                };
                this.step = 1;
                this.selectedDate = "";
                this.$vueOnToast.pop(
                  "success",
                  "Success",
                  response.data.message
                );
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
                this.creating = false;
              });
          }
        });
      }
    }
  }
};
</script>