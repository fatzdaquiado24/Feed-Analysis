<template>
  <div>
    <v-layout class="mb-3" align-center>
      <h1 class="headline font-weight-medium">Laboratory Analysis</h1>
    </v-layout>

    <v-stepper v-model="step" vertical>
      <v-stepper-step :complete="step > 1" step="1">Request for Laboratory Analysis</v-stepper-step>

      <v-stepper-content step="1">
        <form data-vv-scope="create_form" @submit.prevent>
          <v-card v-for="(item, i) in data.feed_analysis_tests.length" :key="i" class="mb-4" tile>
            <v-card-title class="grey darken-3 white--text">Feed Analysis Test # {{ item }}</v-card-title>
            <div class="pa-3">
              <v-text-field
                v-model="data.feed_analysis_tests[i].sample_name"
                :error-messages="errors.collect(`create_form.data.feed_analysis_tests[${i}].sample_name`)"
                v-validate="'required'"
                :data-vv-name="`data.feed_analysis_tests[${i}].supplier_id`"
                data-vv-as="name of sample"
                :key="`create_form.data.feed_analysis_tests[${i}].supplier_id`"
                label="Name of Sample"
                prepend-icon="contact_support"
                @keyup.enter="createLaboratoryAnalysis"
              ></v-text-field>

              <v-select
                v-model="data.feed_analysis_tests[i].analysis_requests"
                :error-messages="errors.collect(`create_form.data.feed_analysis_tests[${i}].analysis_requests`)"
                v-validate="'required'"
                :data-vv-name="`data.feed_analysis_tests[${i}].analysis_requests`"
                data-vv-as="analysis requests"
                :key="`create_form.data.feed_analysis_tests[${i}].analysis_requests`"
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

        <v-btn color="primary" @click="gotoStep(2)">Continue</v-btn>
      </v-stepper-content>

      <v-stepper-step :complete="step > 2" step="2">Select Appointment Date</v-stepper-step>

      <v-stepper-content step="2">
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
            <v-sheet v-if="appointmentDates" height="400" class="mb-3">
              <v-calendar
                v-model="start"
                class="text-xs-center"
                ref="calendar"
                type="month"
                color="blue"
                @click:day="onCalendarDayClick"
              >
                <template v-slot:day="{ date }">
                  <template v-if="appointmentDate(date)">
                    <div
                      class="ma-1 primary"
                    >Appointed: {{appointmentDate(date).appointed}}</div>

                    <div
                      class="ma-1 primary"
                    >Max appointments: {{appointmentDate(date).maximum_appointment}}</div>
                  </template>
                </template>
              </v-calendar>
            </v-sheet>
          </v-flex>
        </v-layout>
        <v-btn @click="gotoStep(1)">Go Back</v-btn>
      </v-stepper-content>
    </v-stepper>
  </div>
</template>

<script>
export default {
  data() {
    return {
      type: "month",
      start: new Date().toISOString(),
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
        return window.axios.get("/appointment-dates")
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
      const fee = this.data.feed_analysis_tests.reduce((total, currentValue) => {
        if (currentValue.analysis_requests == undefined) return total;

        return total + currentValue.analysis_requests
          .reduce((total, currentValue) => {
            return (
              total +
              Number(
                this.chemicalTests.find(object => object.value == currentValue)
                  .fee
              )
            );
          }, 0)
      }, 0).toFixed(2);
      return `Total Fee: Php ${fee}`;
    },
  },
  methods: {
    onCalendarDayClick(date) {

    },
    appointmentDate(date) {
      return this.appointmentDates.find(appointmentDate => appointmentDate.date == date)
    },
    subtotalFee(index) {
      if (this.data.feed_analysis_tests[index].analysis_requests == undefined) return "";

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
    gotoStep(stepNumber) {
      // this.data = {};
      // this.$validator.reset();
      this.step = stepNumber;
    }
  }
};
</script>