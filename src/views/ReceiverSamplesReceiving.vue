<template>
  <div>
    <v-layout class="mb-3" align-center>
      <h1 class="headline font-weight-medium">Samples Receiving</h1>
      <v-spacer></v-spacer>
      <v-btn small class="ma-0" color="teal" dark @click="refresh">Refresh</v-btn>
    </v-layout>

    <v-card>
      <v-card-title>
        <span class="font-weight-bold text-uppercase">Laboratory Analysis Requests Today</span>
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          class="ma-0 pa-0"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>

      <v-data-table
        :headers="tableHeaders"
        :items="items"
        class="elevation-1"
        :loading="loading"
        :search="search"
      >
        <template slot="items" slot-scope="props">
          <td v-for="item in filteredHeaders" :key="item.value" @click="showViewDialog(props.item)">
            <template v-if="item.showArrayLengthOnly">
              <v-chip
                v-if="getArrayLengthFromObject(props.item, item.value) != null"
                small
              >{{ getArrayLengthFromObject(props.item, item.value) }}</v-chip>
            </template>
            <template v-else>{{ getValueFromObject(props.item, item.value, item.subvalue) }}</template>
          </td>
          <td>
            <v-btn
              small
              class="ma-0"
              color="teal"
              dark
              @click="showUpdateDialog(props.item.id)"
            >Mark sample(s) as received</v-btn>
          </td>
        </template>

        <template slot="no-data">
          <span class="text-xs-center">{{ loading ? 'Loading' : 'No appointments with unreceived samples today found' }}</span>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="viewDialog" width="400px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">Request information</v-card-title>
        <v-list two-line subheader>
          <template v-for="object in viewHeaders">
            <v-list-tile
              v-if="getTypeFromObject(selected, object.value, object.subvalue) != 'object'"
              :key="object.text"
            >
              <v-list-tile-content>
                <v-list-tile-title>{{ object.text }}</v-list-tile-title>
                <v-list-tile-sub-title
                  style="white-space: normal"
                >{{ getValueFromObject(selected, object.value, object.subvalue) }}</v-list-tile-sub-title>
              </v-list-tile-content>
            </v-list-tile>

            <v-list-group v-else :key="object.text">
              <v-list-tile slot="activator">
                <v-list-tile-content>
                  <v-list-tile-title>
                    {{ object.text }}
                    <v-chip
                      color="teal lighten-4"
                      class="ma-0"
                      label
                      small
                      disabled
                    >{{ getArrayLengthFromObject(selected, object.value) }}</v-chip>
                  </v-list-tile-title>
                </v-list-tile-content>
              </v-list-tile>

              <v-card
                v-for="(item, index) in getArrayLengthFromObject(selected, object.value)"
                :key="index"
                tile
                flat
              >
                <v-card-title class="grey darken-3 white--text">Sample # {{ item }}</v-card-title>
                <v-list two-line>
                  <v-list-tile v-for="(value, key) in object.list" :key="key" avatar>
                    <v-list-tile-content>
                      <v-list-tile-title>{{ key }}</v-list-tile-title>
                      <v-list-tile-sub-title
                        style="white-space: normal"
                      >{{ getValueFromObject(selected, [object.value, index, value].join('.')) }}</v-list-tile-sub-title>
                    </v-list-tile-content>
                  </v-list-tile>
                </v-list>
              </v-card>
            </v-list-group>
          </template>
        </v-list>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="viewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="updateDialog" width="800px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">Confirm receive?</v-card-title>
        <v-progress-linear class="my-0" :indeterminate="true" height="3" :active="updating"></v-progress-linear>
        <form data-vv-scope="update_form">
          <v-container grid-list-sm class="pa-4">Are you sure you want to mark this as received?</v-container>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="updateDialog = false">Cancel</v-btn>
            <v-btn flat @click="updateLaboratoryAnalysisRequest" :loading="updating">Continue</v-btn>
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
      selected: {},
      viewDialog: false,
      updateDialog: false,
      updateId: null,
      loading: true,
      updating: false,
      headers: [
        { text: "Id", value: "id" },
        { text: "Client Name", value: "client.name" },
        { text: "Email Address", value: "client.email" },
        { text: "Cellphone Number", value: "client.cellphone_number" },
        { text: "Appointment Date", value: "appointment_date" },
        {
          text: "Samples",
          value: "feed_analysis_tests",
          showArrayLengthOnly: true,
          list: {
            Id: "id",
            Name: "sample_name"
          }
        },
        {
          text: "Created At",
          value: "created_at",
          key: null,
          hideInTable: true
        },
        {
          text: "Last Updated At",
          value: "updated_at",
          key: null,
          hideInTable: true
        },
        { text: "Actions", sortable: false }
      ],
      items: [],
      search: ""
    };
  },
  created() {
    window.axios
      .get("/laboratory-analysis-requests")
      .then(response => {
        this.items = response.data;
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
  watch: {
    viewDialog(value) {
      !value ? (this.selected = {}) : null;
    }
  },
  computed: {
    tableHeaders() {
      return this.headers.filter(object => {
        return object.hideInTable !== true;
      });
    },
    filteredHeaders() {
      return this.headers.filter(object => {
        return object.value && object.hideInTable !== true;
      });
    },
    viewHeaders() {
      return this.headers.filter(object => {
        return object.value;
      });
    }
  },
  methods: {
    getArrayLengthFromObject(object, path) {
      let returnValue = object;
      for (
        let i = 0, array = path.split("."), length = array.length;
        i < length;
        i++
      ) {
        if (returnValue != null) {
          returnValue = returnValue[array[i]];
        }
      }

      return Array.isArray(returnValue) ? returnValue.length : null;
    },
    getTypeFromObject(object, path, subpath) {
      let returnValue = object;
      for (
        let i = 0, array = path.split("."), length = array.length;
        i < length;
        i++
      ) {
        if (returnValue != null) {
          returnValue = returnValue[array[i]];
        }
      }

      if (returnValue != null || subpath == null) {
        return typeof returnValue;
      }

      returnValue = object;
      for (
        let i = 0, array = subpath.split("."), length = array.length;
        i < length;
        i++
      ) {
        if (returnValue != null) {
          returnValue = returnValue[array[i]];
        }
      }
      return typeof returnValue;
    },
    getValueFromObject(object, path, subpath, join = true) {
      let returnValue = object;
      for (
        let i = 0, array = path.split("."), length = array.length;
        i < length;
        i++
      ) {
        if (returnValue != null) {
          returnValue = returnValue[array[i]];
        }
      }

      if (returnValue != null || subpath == null) {
        return join && Array.isArray(returnValue)
          ? returnValue.join(", ")
          : returnValue;
      }

      returnValue = object;
      for (
        let i = 0, array = subpath.split("."), length = array.length;
        i < length;
        i++
      ) {
        if (returnValue != null) {
          returnValue = returnValue[array[i]];
        }
      }
      return join && Array.isArray(returnValue)
        ? returnValue.join(", ")
        : returnValue;
    },
    refresh() {
      this.items = [];
      this.loading = true;

      window.axios
        .get("/laboratory-analysis-requests")
        .then(response => {
          this.items = response.data;
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
    showViewDialog(object) {
      this.selected = object;
      this.viewDialog = true;
    },
    showUpdateDialog(id) {
      this.updateId = id;
      this.$validator.reset();
      this.updateDialog = true;
    },
    updateLaboratoryAnalysisRequest() {
      if (!this.updating && this.updateDialog) {
        this.$validator.validateAll("update_form").then(result => {
          if (result) {
            this.updating = true;

            window.axios
              .put(`/laboratory-analysis-requests/${this.updateId}`)
              .then(response => {
                this.updateDialog = false;
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
                this.updating = false;
              });
          }
        });
      }
    }
  }
};
</script>
