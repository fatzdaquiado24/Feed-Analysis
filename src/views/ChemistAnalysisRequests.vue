<template>
  <div>
    <v-layout class="mb-3" align-center>
      <h1 class="headline font-weight-medium">Laboratory Analysis Requests</h1>
      <v-spacer></v-spacer>
      <v-btn small class="ma-0" color="teal" dark @click="refresh">Refresh</v-btn>
    </v-layout>

    <v-card>
      <v-card-title>
        <span class="font-weight-bold text-uppercase">Laboratory Analysis Requests</span>
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
          <td
            v-for="item in filteredHeaders"
            :key="item.value"
            @click="showViewDialog(props.item)"
          >{{ getValueFromObject(props.item, item.value, item.subvalue) }}</td>
          <td>
            <v-icon small @click="showUpdateDialog(props.item.id)" title="Update Record">edit</v-icon>
          </td>
        </template>

        <template slot="no-data">
          <span class="text-xs-center">{{ loading ? 'Loading' : 'No data found' }}</span>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="viewDialog" width="400px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">Request information</v-card-title>
        <v-list two-line subheader>
          <v-list-tile v-for="object in viewHeaders" :key="object.text">
            <v-list-tile-content>
              <v-list-tile-title>{{ object.text }}</v-list-tile-title>
              <v-list-tile-sub-title
                style="white-space: normal"
              >{{ getValueFromObject(selected, object.value, object.subvalue) }}</v-list-tile-sub-title>
            </v-list-tile-content>
          </v-list-tile>
        </v-list>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="viewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="updateDialog" width="800px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">Update request</v-card-title>
        <v-container grid-list-sm class="pa-4" v-if="updateDialog">
          <v-card
            v-for="(feed_analysis_test, index) in updatingLaboratoryAnalysisRequest.feed_analysis_tests"
            class="mb-3"
            :key="index"
            tile
          >
            <v-card-title class="grey darken-3 white--text">Feed Analysis Test # {{ index + 1 }}</v-card-title>
            <v-list two-line>
              <v-list-tile avatar>
                <v-list-tile-content>
                  <v-list-tile-title>Sample Id</v-list-tile-title>
                  <v-list-tile-sub-title
                    style="white-space: normal"
                  >{{ getValueFromObject(feed_analysis_test, 'id') }}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>

              <v-list-tile avatar>
                <v-list-tile-content>
                  <v-list-tile-title>Sample Name</v-list-tile-title>
                  <v-list-tile-sub-title
                    style="white-space: normal"
                  >{{ getValueFromObject(feed_analysis_test, 'sample_name') }}</v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>

              <v-list-tile avatar>
                <v-list-tile-content>
                  <v-list-tile-title>Analysis Requested</v-list-tile-title>
                  <v-list-tile-sub-title style="white-space: normal">
                    <v-card
                      v-for="(item, index2) in getValueFromObject(feed_analysis_test, 'analysis_requests', null, false)"
                      :key="index2"
                      class="mx-1 mt-1 mb-2"
                      tile
                    >
                      <v-card-title
                        class="primary white--text"
                      >Analysis Requested # {{ index2 + 1 }}</v-card-title>
                      <v-list two-line>
                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Name</v-list-tile-title>
                            <v-list-tile-sub-title
                              style="white-space: normal"
                            >{{ getValueFromObject(item, 'parameter') }}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>

                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Method</v-list-tile-title>
                            <v-list-tile-sub-title
                              style="white-space: normal"
                            >{{ getValueFromObject(item, 'method') }}</v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>

                        <v-list-tile>
                          <v-list-tile-content>
                            <v-list-tile-title>Result (%)</v-list-tile-title>
                            <v-list-tile-sub-title style="white-space: normal">
                              <form :data-vv-scope="`update_form[${item.id}]`" @submit.prevent>
                                <v-text-field
                                  v-model="updatingLaboratoryAnalysisRequest.feed_analysis_tests[index].analysis_requests[index2].result"
                                  :error-messages="errors.collect(`update_form[${item.id}].result`)"
                                  v-validate="'required|min_value:0|max_value:100'"
                                  data-vv-name="result"
                                  data-vv-as="result"
                                  :key="`update_form[${item.id}].result`"
                                  placeholder="Fill up result"
                                  append-icon="edit"
                                  :loading="updating && item.id == updateId"
                                  @keyup.enter="updateResult(item.id, index, index2)"
                                  @click:append="updateResult(item.id, index, index2)"
                                ></v-text-field>
                              </form>
                            </v-list-tile-sub-title>
                          </v-list-tile-content>
                        </v-list-tile>
                      </v-list>
                    </v-card>
                  </v-list-tile-sub-title>
                </v-list-tile-content>
              </v-list-tile>
            </v-list>
          </v-card>
        </v-container>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="updateDialog = false">Close</v-btn>
        </v-card-actions>
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
        { text: "Client Name", value: "client.name", key: null },
        { text: "Email Address", value: "client.email", key: null },
        {
          text: "Cellphone Number",
          value: "client.cellphone_number",
          key: null
        },
        {
          text: "Sample Received By",
          value: "receiver.name",
          subvalue: "receiver",
          key: null
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
        {
          text: "Tests",
          value: "feed_analysis_tests",
          hideInTable: true,
          hideInViewDialog: true
        },
        { text: "Actions", sortable: false }
      ],
      items: [],
      updatingLaboratoryAnalysisRequest: {},
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
        return object.hideInTable !== true && object.hidden !== true;
      });
    },
    filteredHeaders() {
      return this.headers.filter(object => {
        return object.value && object.hideInTable !== true && object.hidden !== true;
      });
    },
    viewHeaders() {
      return this.headers.filter(object => {
        return object.value && object.hideInViewDialog !== true;
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
      const rawCurrentLaboratoryAnalysisRequest = this.items.find(
        object => object.id === id
      );

      const currentLaboratoryAnalysisRequest = this.headers.reduce(
        (object, currentObject) => {
          if (currentObject.value && currentObject.value != "id") {
            if (currentObject.key) {
              object[currentObject.key] = this.getValueFromObject(
                rawCurrentLaboratoryAnalysisRequest,
                currentObject.path,
                null,
                false
              );
            } else {
              object[currentObject.value] = this.getValueFromObject(
                rawCurrentLaboratoryAnalysisRequest,
                currentObject.value,
                null,
                false
              );
            }
          }
          return object;
        },
        {}
      );

      this.updatingLaboratoryAnalysisRequest = currentLaboratoryAnalysisRequest;
      this.$validator.reset();
      this.updateDialog = true;
    },
    updateResult(id, index, index2) {
      if (!this.updating && this.updateDialog) {
        this.$validator.validateAll(`update_form[${id}]`).then(result => {
          if (result) {
            this.updating = true;
            this.updateId = id

            window.axios
              .put(`/analysis-requests/${id}`, { result: this.updatingLaboratoryAnalysisRequest.feed_analysis_tests[index].analysis_requests[index2].result })
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
