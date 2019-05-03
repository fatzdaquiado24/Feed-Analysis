<template>
  <div>
    <v-layout class="mb-3" align-center>
      <h1 class="headline font-weight-medium">Our Office Location</h1>
    </v-layout>

    <section>
      <v-container>
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3925.3348376950994!2d123.88519731471949!3d10.315065170360427!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a9994b05612cdf%3A0x43ae638feefe1187!2sDepartment+Of+Agriculture!5e0!3m2!1sen!2sph!4v1556856462360!5m2!1sen!2sph"
          height="450"
          frameborder="0"
          style="border:0;width:100%"
          allowfullscreen
        ></iframe>
      </v-container>
    </section>
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
  mounted() {
    if (this.$store.state.successMessage) {
      this.$vueOnToast.pop(
        "success",
        "Success",
        this.$store.state.successMessage
      );
      this.$store.commit("unsetSuccessMessage");
    }
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