<template>
  <div>
    <v-layout class="mb-3" align-center>
      <h1 class="headline font-weight-medium">Chemical Tests</h1>
      <v-spacer></v-spacer>
      <v-btn small class="ma-0" color="teal" dark @click="refresh">Refresh</v-btn>
    </v-layout>

    <v-card>
      <v-card-title>
        <span class="font-weight-bold text-uppercase">Chemical Tests</span>
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
          >{{ getValueFromObject(props.item, item.value) }}</td>
          <td>
            <v-icon
              small
              class="mr-2"
              @click="showUpdateDialog(props.item.id)"
              title="Update Record"
            >edit</v-icon>
            <v-icon small @click="showDeleteDialog(props.item.id)" title="Delete Record">delete</v-icon>
          </td>
        </template>

        <template slot="no-data">
          <span class="text-xs-center">{{ loading ? 'Loading' : 'No data found' }}</span>
        </template>
      </v-data-table>
    </v-card>

    <floating-action-button @click.native="showCreateDialog" title="Add New Record"/>

    <v-dialog v-model="createDialog" width="800px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">Create chemical test</v-card-title>
        <v-progress-linear class="my-0" :indeterminate="true" height="3" :active="creating"></v-progress-linear>
        <form data-vv-scope="create_form">
          <v-container grid-list-sm class="pa-4">
            <v-text-field
              v-model="newChemicalTest.parameter"
              :error-messages="errors.collect('create_form.parameter')"
              v-validate="'required'"
              data-vv-name="parameter"
              key="create_form.parameter"
              label="Parameter"
              prepend-icon="account_box"
              @keyup.enter="createChemicalTest"
            ></v-text-field>

            <v-text-field
              v-model="newChemicalTest.method"
              :error-messages="errors.collect('create_form.method')"
              v-validate="'required'"
              data-vv-name="method"
              key="create_form.method"
              label="Method"
              prepend-icon="hourglass_empty"
              @keyup.enter="createChemicalTest"
            ></v-text-field>

            <v-text-field
              v-model="newChemicalTest.fee"
              maxlength="9"
              :error-messages="errors.collect('create_form.fee')"
              v-validate="'required|decimal:2|min_value:0|max_value:999999.99'"
              data-vv-name="fee"
              key="create_form.fee"
              label="Fee"
              prepend-icon="money"
              @keyup.enter="createChemicalTest"
            ></v-text-field>
          </v-container>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="createDialog = false">Cancel</v-btn>
            <v-btn flat @click="createChemicalTest" :loading="creating">Save</v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialog" width="400px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">ChemicalTest information</v-card-title>
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
        <v-card-title class="grey lighten-4 py-4 title">Update chemical test</v-card-title>
        <v-progress-linear class="my-0" :indeterminate="true" height="3" :active="updating"></v-progress-linear>
        <form data-vv-scope="update_form">
          <v-container grid-list-sm class="pa-4">
            <v-text-field
              v-model="updatingChemicalTest.parameter"
              :error-messages="errors.collect('update_form.parameter')"
              v-validate="'required'"
              data-vv-name="parameter"
              key="update_form.parameter"
              label="Parameter"
              prepend-icon="account_box"
              @keyup.enter="updateChemicalTest"
            ></v-text-field>

            <v-text-field
              v-model="updatingChemicalTest.method"
              :error-messages="errors.collect('update_form.method')"
              v-validate="'required'"
              data-vv-name="method"
              key="update_form.method"
              label="Method"
              prepend-icon="hourglass_empty"
              @keyup.enter="updateChemicalTest"
            ></v-text-field>

            <v-text-field
              v-model="updatingChemicalTest.fee"
              maxlength="9"
              :error-messages="errors.collect('update_form.fee')"
              v-validate="'required|decimal:2|min_value:0.00|max_value:999999.99'"
              data-vv-name="fee"
              key="update_form.fee"
              label="Fee"
              prepend-icon="money"
              @keyup.enter="updateChemicalTest"
            ></v-text-field>
          </v-container>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="updateDialog = false">Cancel</v-btn>
            <v-btn flat @click="updateChemicalTest" :loading="updating">Update</v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" width="800px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">Confirm delete?</v-card-title>
        <v-progress-linear class="my-0" :indeterminate="true" height="3" :active="deleting"></v-progress-linear>

        <v-container grid-list-sm class="pa-4">Are you sure you want to delete this chemical test?</v-container>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn flat @click="deleteChemicalTest" :loading="deleting">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import FloatingActionButton from "@/components/FloatingActionButton.vue";

export default {
  data() {
    return {
      selected: {},
      viewDialog: false,
      createDialog: false,
      updateDialog: false,
      deleteDialog: false,
      updateId: null,
      deleteId: null,
      loading: true,
      creating: false,
      updating: false,
      deleting: false,
      headers: [
        { text: "Id", value: "id" },
        { text: "Parameter", value: "parameter" },
        { text: "Method", value: "method" },
        { text: "Fee", value: "fee" },
        { text: "Created At", value: "created_at", key: null },
        {
          text: "Last Updated At",
          value: "updated_at",
          key: null,
          hideInTable: true
        },
        { text: "Actions", sortable: false }
      ],
      items: [],
      search: "",
      newChemicalTest: {},
      updatingChemicalTest: {}
    };
  },
  created() {
    window.axios
      .get("/chemical-tests")
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
        .get("/chemical-tests")
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
    showCreateDialog() {
      this.newChemicalTest = {};
      this.$validator.reset();
      this.createDialog = true;
    },
    createChemicalTest() {
      if (!this.creating && this.createDialog) {
        this.$validator.validateAll("create_form").then(result => {
          if (result) {
            this.creating = true;

            window.axios
              .post("/chemical-tests", this.newChemicalTest)
              .then(response => {
                this.createDialog = false;
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
                this.creating = false;
              });
          }
        });
      }
    },
    showUpdateDialog(id) {
      const rawCurrentChemicalTest = this.items.find(
        object => object.id === id
      );

      const currentChemicalTest = this.headers.reduce(
        (object, currentObject) => {
          if (currentObject.value && currentObject.value != "id") {
            if (currentObject.key) {
              object[currentObject.key] = this.getValueFromObject(
                rawCurrentChemicalTest,
                currentObject.path,
                null,
                false
              );
            } else {
              object[currentObject.value] = this.getValueFromObject(
                rawCurrentChemicalTest,
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

      this.updateId = id;
      this.updatingChemicalTest = currentChemicalTest;
      this.$validator.reset();
      this.updateDialog = true;
    },
    updateChemicalTest() {
      if (!this.updating && this.updateDialog) {
        this.$validator.validateAll("update_form").then(result => {
          if (result) {
            this.updating = true;

            const data = {};
            Object.keys(this.updatingChemicalTest).forEach(key => {
              const value = this.updatingChemicalTest[key];
              value != "" ? (data[key] = value) : null;
            });

            window.axios
              .put(`/chemical-tests/${this.updateId}`, data)
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
    },
    showDeleteDialog(id) {
      this.deleteId = id;
      this.deleteDialog = true;
    },
    deleteChemicalTest() {
      if (!this.deleting && this.deleteDialog) {
        this.deleting = true;

        window.axios
          .delete(`/chemical-tests/${this.deleteId}`)
          .then(response => {
            this.deleteDialog = false;
            this.$vueOnToast.pop("success", "Success", response.data.message);
            this.refresh();
          })
          .catch(error => {
            this.deleteDialog = false;
            this.$vueOnToast.pop(
              "error",
              "Error",
              error.response
                ? error.response.data.message
                : "An Error Has Occurred"
            );
          })
          .finally(() => {
            this.deleting = false;
          });
      }
    }
  },
  components: {
    FloatingActionButton
  }
};
</script>
