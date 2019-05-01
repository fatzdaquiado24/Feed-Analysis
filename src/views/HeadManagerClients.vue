<template>
  <div>
    <v-layout class="mb-3" align-center>
      <h1 class="headline font-weight-medium">Clients</h1>
      <v-spacer></v-spacer>
      <v-btn small class="ma-0" color="teal" dark @click="refresh">Refresh</v-btn>
    </v-layout>

    <v-card>
      <v-card-title>
        <span class="font-weight-bold text-uppercase">Clients</span>
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
              v-if="props.item.status == 'For approval'"
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

    <v-dialog v-model="viewDialog" width="600px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">Client information</v-card-title>
        <v-list two-line subheader>
          <v-list-tile v-for="object in viewHeaders" :key="object.text">
            <v-list-tile-content>
              <v-list-tile-title>{{ object.text }}</v-list-tile-title>
              <v-list-tile-sub-title style="white-space: normal">
                <template
                  v-if="!object.isImage"
                >{{ getValueFromObject(selected, object.value, object.subvalue) }}</template>

                <img
                  v-else-if="getValueFromObject(selected, object.value) != null"
                  :src="getValueFromObject(selected, object.value)"
                  style="max-width:100%"
                >

                <template v-else>-</template>
              </v-list-tile-sub-title>
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
        <v-card-title class="grey lighten-4 py-4 title">Confirm update?</v-card-title>
        <v-progress-linear class="my-0" :indeterminate="true" height="3" :active="deleting"></v-progress-linear>
        <form data-vv-scope="update_form">
          <v-container grid-list-sm class="pa-4">
            <v-select
              v-model="updatingClient.status"
              :error-messages="errors.collect('update_form.status')"
              v-validate="'required'"
              data-vv-name="status"
              key="update_form.status"
              :items="['Approved', 'Denied']"
              prepend-icon="playlist_add_check"
              menu-props="auto"
              label="Status"
            ></v-select>
          </v-container>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn flat color="primary" @click="updateDialog = false">Cancel</v-btn>
            <v-btn flat @click="updateClient" :loading="updating">Update</v-btn>
          </v-card-actions>
        </form>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" width="800px">
      <v-card>
        <v-card-title class="grey lighten-4 py-4 title">Confirm delete?</v-card-title>
        <v-progress-linear class="my-0" :indeterminate="true" height="3" :active="deleting"></v-progress-linear>

        <v-container grid-list-sm class="pa-4">Are you sure you want to delete this client?</v-container>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn flat color="primary" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn flat @click="deleteClient" :loading="deleting">Delete</v-btn>
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
      deleteDialog: false,
      updateId: null,
      deleteId: null,
      loading: true,
      updating: false,
      deleting: false,
      headers: [
        { text: "Id", value: "id" },
        { text: "Name", value: "name" },
        { text: "Email Address", value: "email" },
        { text: "Cellphone Number", value: "cellphone_number" },
        { text: "Address", value: "address", hideInTable: true },
        {
          text: "Valid Id",
          value: "valid_id",
          hideInTable: true,
          isImage: true
        },
        {
          text: "Business Permit",
          value: "business_permit",
          hideInTable: true,
          isImage: true
        },
        { text: "Created At", value: "created_at" },
        {
          text: "Last Updated At",
          value: "updated_at",
          hideInTable: true
        },
        { text: "Status", value: "status" },
        { text: "Actions", sortable: false }
      ],
      items: [],
      search: "",
      newClient: {},
      updatingClient: {}
    };
  },
  created() {
    window.axios
      .get("/clients")
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
        .get("/clients")
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
      const rawCurrentClient = this.items.find(
        object => object.id === id
      );

      const currentClient = this.headers.reduce(
        (object, currentObject) => {
          if (currentObject.value && currentObject.value != "id") {
            if (currentObject.key) {
              object[currentObject.key] = this.getValueFromObject(
                rawCurrentClient,
                currentObject.path,
                null,
                false
              );
            } else {
              object[currentObject.value] = this.getValueFromObject(
                rawCurrentClient,
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
      this.updatingClient = currentClient;
      this.$validator.reset();
      this.updateDialog = true;
    },
    updateClient() {
      if (!this.updating && this.updateDialog) {
        this.$validator.validateAll("update_form").then(result => {
          if (result) {
            this.updating = true;

            window.axios
              .put(`/clients/${this.updateId}`, this.updatingClient)
              .then(response => {
                this.updateDialog = false
                this.$vueOnToast.pop(
                  "success",
                  "Success",
                  response.data.message
                )
                this.refresh()
              })
              .catch(error => {
                if (error.response && "errors" in error.response.data) {
                  const errors = error.response.data.errors

                  for (const messages of Object.values(errors)) {
                    for (const message of messages) {
                      this.$vueOnToast.pop("error", "Error", message)
                    }
                  }
                } else {
                  this.$vueOnToast.pop(
                    "error",
                    "Error",
                    error.response
                      ? error.response.data.message
                      : "An Error Has Occurred"
                  )
                }
              })
              .finally(() => {
                this.updating = false
              })
          }
        });
      }
    },
    showDeleteDialog(id) {
      this.deleteId = id;
      this.deleteDialog = true;
    },
    deleteClient() {
      if (!this.deleting && this.deleteDialog) {
        this.deleting = true;

        window.axios
          .delete(`/clients/${this.deleteId}`)
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
  }
};
</script>
