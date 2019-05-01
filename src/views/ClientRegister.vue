<template>
  <v-app row>
    <toast-container></toast-container>

    <v-layout>
      <v-flex xs12 d-flex align-center justify-center>
        <v-card class="elevation-4 my-4" max-width="400px">
          <v-card-title class="primary white--text py-4 title">Register</v-card-title>

          <v-card-text class="pb-0">
            <v-form @submit.prevent>
              <v-text-field
                v-model="newUser.name"
                :error-messages="errors.collect('name')"
                v-validate="'required'"
                data-vv-name="name"
                label="Name"
                prepend-icon="account_box"
                @keyup.enter="register"
              ></v-text-field>

              <v-text-field
                v-model="newUser.address"
                :error-messages="errors.collect('address')"
                v-validate="'required'"
                data-vv-name="address"
                label="Address"
                prepend-icon="place"
                @keyup.enter="register"
              ></v-text-field>

              <v-text-field
                v-model="newUser.cellphone_number"
                :error-messages="errors.collect('cellphone_number')"
                v-validate="{ required: true, digits: 10 }"
                data-vv-name="cellphone_number"
                data-vv-as="cellphone number"
                counter="10"
                maxlength="10"
                label="Cellphone Number"
                prepend-icon="phone_android"
                prefix="+63"
                persistent-hint
                @keyup.enter="register"
              ></v-text-field>

              <v-text-field
                v-model="newUser.email"
                :error-messages="errors.collect('email')"
                v-validate="'required|email'"
                data-vv-name="email"
                prepend-icon="mail"
                label="Email"
                @keyup.enter="register"
              ></v-text-field>

              <v-text-field
                v-model="newUser.password"
                :error-messages="errors.collect('password')"
                v-validate="'required|min:8'"
                data-vv-name="password"
                prepend-icon="lock"
                label="Password"
                type="password"
                ref="password"
                @keyup.enter="register"
              ></v-text-field>

              <v-text-field
                v-model="newUser.password_confirmation"
                :error-messages="errors.collect('confirm_password')"
                v-validate="'required|confirmed:password'"
                data-vv-name="confirm_password"
                data-vv-as="confirmation password"
                prepend-icon="lock_open"
                label="Confirm Password"
                type="password"
                @keyup.enter="register"
              ></v-text-field>

              <v-select
                v-model="newUser.client_type"
                :error-messages="errors.collect('client_type')"
                v-validate="'required'"
                data-vv-name="client_type"
                data-vv-as="client type"
                :items="['Student', 'Farm Owner', 'Business Owner']"
                prepend-icon="person"
                menu-props="auto"
                label="Client type"
              ></v-select>

              <v-text-field
                v-if="newUser.client_type"
                v-model="validIdPictureImageName"
                :error-messages="errors.collect('valid_id')"
                v-validate="'required'"
                data-vv-name="valid_id"
                data-vv-as="valid id"
                label="Valid Id (Image)"
                @click="$refs.validIdImageFileButton.click()"
                @keyup.enter="$refs.validIdImageFileButton.click()"
                prepend-icon="featured_play_list"
                readonly
              ></v-text-field>
              <input
                v-show="false"
                type="file"
                ref="validIdImageFileButton"
                accept=".jpg, .jpeg, .png"
                @change="onValidIdImageSelected"
              >

              <v-text-field
                v-if="newUser.client_type == 'Business Owner'"
                v-model="validBusinessPermitImageName"
                :error-messages="errors.collect('business_permit')"
                v-validate="'required'"
                data-vv-name="business_permit"
                data-vv-as="business permit"
                label="Business Permit (Image)"
                @click="$refs.validBusinessPermitFileButton.click()"
                @keyup.enter="$refs.validBusinessPermitFileButton.click()"
                prepend-icon="camera_alt"
                readonly
              ></v-text-field>
              <input
                v-show="false"
                type="file"
                ref="validBusinessPermitFileButton"
                accept=".jpg, .jpeg, .png"
                @change="onBusinessPermitImageSelected"
              >
            </v-form>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <router-link class="mr-2" :to="{name: 'ClientLogin'}">Already have an account?</router-link>
            <v-btn small color="primary" @click="register" :loading="loading">Register</v-btn>
          </v-card-actions>
        </v-card>
      </v-flex>

      <v-flex class="background-cover" md12></v-flex>
    </v-layout>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      loading: false,
      newUser: {},
      validIdPictureImageName: "",
      validBusinessPermitImageName: "",
    }
  },
  computed: {
    registerUser() {
      return Object.assign({}, this.newUser, {
        cellphone_number: `63${this.newUser.cellphone_number}`
      })
    }
  },
  methods: {
    onValidIdImageSelected(event) {
      const files = event.target.files

      if (files[0] !== undefined) {
        this.validIdPictureImageName = files[0].name

        if (this.validIdPictureImageName.lastIndexOf(".") <= 0) {
          return
        }

        const fileReader = new FileReader()
        fileReader.readAsDataURL(files[0])
        fileReader.addEventListener("load", () => {
          this.newUser.valid_id = files[0]
        })
      }
    },
    onBusinessPermitImageSelected(image) {
      const files = image.target.files
      if (files[0] !== undefined) {
        this.validBusinessPermitImageName = files[0].name

        if (this.validBusinessPermitImageName.lastIndexOf(".") <= 0) {
          return
        }

        const fileReader = new FileReader()
        fileReader.readAsDataURL(files[0])
        fileReader.addEventListener("load", () => {
          this.newUser.business_permit = files[0]
        })
      }
    },
    register() {
      if (!this.loading) {
        this.$validator.validateAll().then(result => {
          if (result) {
            this.loading = true

            const formData = new FormData()
            for(let key in this.registerUser) {
              if(key == "business_permit" && this.registerUser.client_type != "Business Owner") {
                continue
              }
              formData.append(key, this.registerUser[key])
            }

            window.axios
              .post("/register", formData, {
                headers: {
                  "Content-Type":
                    "multipart/form-data;boundary=----WebKitFormBoundaryyrV7KO0BoCBuDbTL"
                }
              })
              .then(response => {
                this.loading = false
                this.$store.commit("setSuccessMessage", response.data.message)
                this.$router.push({ name: "ClientLogin" })
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
                this.loading = false
              })
          }
        })
      }
    }
  }
}
</script>

<style scoped>
.background-cover {
  background: url("/images/background.jpg");
  background-size: cover;
  background-repeat: no-repeat;
  opacity: 0.6;
}
</style>
