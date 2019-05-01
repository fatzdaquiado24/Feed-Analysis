<template>
  <div>
    <v-layout class="mb-3" align-center>
      <h1 class="headline font-weight-medium">Chemists</h1>
      <v-spacer></v-spacer>
      <v-btn small class="ma-0" color="teal" dark @click="refresh">Refresh</v-btn>
    </v-layout>

    <v-card>
      <v-card-title>
        <span class="font-weight-bold text-uppercase">Chemists</span>
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
        <v-card-title class="grey lighten-4 py-4 title">Create chemist</v-card-title>
        <v-progress-linear class="my-0" :indeterminate="true" height="3" :active="creating"></v-progress-linear>
        <form data-vv-scope="create_form">
          <v-container grid-list-sm class="pa-4">
            <v-text-field
              v-model="newChemist.name"
              :error-messages="errors.collect('create_form.name')"
              v-validate="'required'"
              data-vv-name="name"
              label="Name"
              prepend-icon="account_box"
              @keyup.enter="createChemist"
            ></v-text-field>

            <v-text-field
              v-model="newChemist.cellphone_number"
              :error-messages="errors.collect('create_form.cellphone_number')"
              v-validate="{ digits: 10 }"
              data-vv-name="cellphone_number"
              data-vv-as="cellphone number"
              counter="10"
              maxlength="10"
              label="Cellphone Number"
              prepend-icon="phone_android"
              prefix="+63"
              hint="(Optional)"
              persistent-hint
              @keyup.enter="createChemist"
            ></v-text-field>

            <v-text-field
              v-model="newChemist.email"
              :error-messages="errors.collect('create_form.email')"
              v-validate="'required|email'"
              data-vv-name="email"
              prepend-icon="mail"
              label="Email"
              @keyup.enter="createChemist"
            ></v-text-field>

            <v-text-field
              v-model="newChemist.password"
              :error-messages="errors.collect('create_form.password')"
              v-validate="'required|min:8'"
              data-vv-name="password"
              prepend-icon="lock"
              label="Password"
              type="password"
              ref="create_form.password"
              @keyup.enter="createChemist"
            ></v-text-field>

            <v-text-field
              v-model="newChemist.password_confirmation"
              :error-messages="errors.collect('create_form.confirm_password')"
              v-validate="'required|confirmed:password'"
              data-vv-name="confirm_password"
              data-vv-as="confirmation password"
              prepend-icon="lock_open"
              label="Confirm Password"
              type="password"
              @keyup.enter="createChemist"
            ></v-text-field>
          </v-container>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="createDialog = false">Cancel</v-btn>
            <v-btn flat @click="createChemist" :loading="creating">Save</v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="viewDialog" width="400px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">Chemist information</v-card-title>
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
        <v-card-title class="grey lighten-4 py-4 title">Update chemist</v-card-title>
        <v-progress-linear class="my-0" :indeterminate="true" height="3" :active="updating"></v-progress-linear>
        <form data-vv-scope="update_form">
          <v-container grid-list-sm class="pa-4">
            <v-text-field
              v-model="updatingChemist.name"
              :error-messages="errors.collect('update_form.name')"
              v-validate="'required'"
              data-vv-name="name"
              label="Name"
              prepend-icon="account_box"
              @keyup.enter="updateChemist"
            ></v-text-field>

            <v-text-field
              v-model="updatingChemist.cellphone_number"
              :error-messages="errors.collect('update_form.cellphone_number')"
              v-validate="{ digits: 10 }"
              data-vv-name="cellphone_number"
              data-vv-as="cellphone number"
              counter="10"
              maxlength="10"
              label="Cellphone Number"
              prepend-icon="phone_android"
              prefix="+63"
              hint="(Optional)"
              persistent-hint
              @keyup.enter="updateChemist"
            ></v-text-field>

            <v-text-field
              v-model="updatingChemist.email"
              :error-messages="errors.collect('update_form.email')"
              v-validate="'required|email'"
              data-vv-name="email"
              prepend-icon="mail"
              label="Email"
              @keyup.enter="updateChemist"
            ></v-text-field>

            <v-text-field
              v-model="updatingChemist.password"
              :error-messages="errors.collect('update_form.password')"
              v-validate="'min:8'"
              data-vv-name="password"
              prepend-icon="lock"
              label="Password"
              type="password"
              ref="update_form.password"
              hint="Leave blank to remain the same"
              persistent-hint
              @keyup.enter="updateChemist"
            ></v-text-field>

            <v-text-field
              v-model="updatingChemist.password_confirmation"
              :error-messages="errors.collect('update_form.confirm_password')"
              v-validate="{ required: updatingChemist.password != null && updatingChemist.password != '', confirmed: 'password' }"
              data-vv-name="confirm_password"
              data-vv-as="confirmation password"
              prepend-icon="lock_open"
              label="Confirm Password"
              type="password"
              persistent-hint
              @keyup.enter="updateChemist"
            ></v-text-field>
          </v-container>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="updateDialog = false">Cancel</v-btn>
            <v-btn flat @click="updateChemist" :loading="updating">Update</v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" width="800px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">Confirm delete?</v-card-title>
        <v-progress-linear class="my-0" :indeterminate="true" height="3" :active="deleting"></v-progress-linear>

        <v-container grid-list-sm class="pa-4">Are you sure you want to delete this chemist?</v-container>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn flat @click="deleteChemist" :loading="deleting">Delete</v-btn>
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
        { text: "Name", value: "name" },
        { text: "Cellphone Number", value: "cellphone_number" },
        { text: "Email Address", value: "email" },
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
      newChemist: {},
      updatingChemist: {}
    };
  },
  created() {
    window.axios
      .get("/chemists")
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
    },
    newChemistData() {
      if(this.newChemist.cellphone_number != undefined && this.newChemist.cellphone_number != '') {
        return Object.assign({}, this.newChemist, {
          cellphone_number: `63${this.newChemist.cellphone_number}`
        });
      } else {
        return Object.assign({}, this.newChemist, {
          cellphone_number: null
        });
      }
    },
    updatingChemistData() {
      if(this.updatingChemist.cellphone_number != undefined && this.updatingChemist.cellphone_number != '') {
        return Object.assign({}, this.updatingChemist, {
          cellphone_number: `63${this.updatingChemist.cellphone_number}`
        });
      } else {
        return Object.assign({}, this.updatingChemist, {
          cellphone_number: null
        });
      }
    },
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
        .get("/chemists")
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
      this.newChemist = {};
      this.$validator.reset();
      this.createDialog = true;
    },
    createChemist() {
      if (!this.creating && this.createDialog) {
        this.$validator.validateAll("create_form").then(result => {
          if (result) {
            this.creating = true;

            window.axios
              .post("/chemists", this.newChemistData)
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
      const rawCurrentChemist = this.items.find(object => object.id === id);

      const currentChemist = this.headers.reduce((object, currentObject) => {
        if (currentObject.value && currentObject.value != "id") {
          if (currentObject.key) {
            object[currentObject.key] = this.getValueFromObject(
              rawCurrentChemist,
              currentObject.path,
              null,
              false
            );
          } else {
            object[currentObject.value] = this.getValueFromObject(
              rawCurrentChemist,
              currentObject.value,
              null,
              false
            );
          }
        }
        return object;
      }, {});

      if(currentChemist.cellphone_number) currentChemist.cellphone_number = currentChemist.cellphone_number.substr(2)

      this.updateId = id;
      this.updatingChemist = currentChemist;
      this.$validator.reset();
      this.updateDialog = true;
    },
    updateChemist() {
      if (!this.updating && this.updateDialog) {
        this.$validator.validateAll("update_form").then(result => {
          if (result) {
            this.updating = true;

            const data = {};
            Object.keys(this.updatingChemistData).forEach(key => {
              const value = this.updatingChemistData[key];
              value != '' ? (data[key] = value) : null;
            });
            console.log(data)

            window.axios
              .put(`/chemists/${this.updateId}`, data)
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
    deleteChemist() {
      if (!this.deleting && this.deleteDialog) {
        this.deleting = true;

        window.axios
          .delete(`/chemists/${this.deleteId}`)
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
