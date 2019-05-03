<template>
  <div>
    <v-layout class="mb-3" align-center>
      <h1 class="headline font-weight-medium">Analysis Reports</h1>
      <v-spacer></v-spacer>
      <v-btn small class="ma-0" color="teal" dark @click="refresh">Refresh</v-btn>
    </v-layout>

    <v-card>
      <v-card-title>
        <span class="font-weight-bold text-uppercase">Analysis Reports</span>
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
            <v-icon
							small
							class="mr-2"
							@click="showMeatInspectionCertificate(props.item.id)"
							title="Certificate"
						>
							visibility
						</v-icon>
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

    <v-dialog v-model="certificateDialog" width="800px">
			<v-card>
				<v-card-title class="grey lighten-4 py-4 title">Certificate</v-card-title>
				<v-container grid-list-sm class="pa-4 text-xs-center">
					<v-progress-circular v-if="certificateLoading" :size="50"
						color="primary"
						indeterminate />
					<span v-else-if="certificateError">{{ certificateError }}</span>
					<embed v-else :src="`data:application/pdf;base64,${certificateData}`" style="width:100%;height:400px;">
				</v-container>
				<v-card-actions>
					<v-spacer></v-spacer>
					<v-btn flat color="primary" @click="certificateDialog = false">Cancel</v-btn>
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
      loading: true,
      headers: [
        { text: "Id", value: "id" },
        { text: "Client Name", value: "client.name" },
        { text: "Email Address", value: "client.email" },
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
      search: "",
      certificateDialog: false,
			certificateLoading: false,
			certificateError: null,
			certificateData: null,
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
    showMeatInspectionCertificate(id) {
			this.certificateError = null
			this.certificateData = null
			this.certificateLoading = true
			this.certificateDialog = true

			window.axios.get(`/certificates/${id}`)
				.then(response => {
					this.certificateData = response.data.pdf
				})
				.catch(error => {
					let message = error.response ? error.response.data.message : 'An Error Has Occurred'
					this.certificateError = message
					this.$vueOnToast.pop('error', 'Error', message)
				})
				.finally(() => {
					this.certificateLoading = false
				})
		},
    showViewDialog(object) {
      this.selected = object;
      this.viewDialog = true;
    },
  }
};
</script>
