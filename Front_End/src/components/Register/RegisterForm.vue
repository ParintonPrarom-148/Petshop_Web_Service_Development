<template>
  <form @submit.prevent="signup" novalidate>
    <div class="px-4 mt-5">
      <div class="row">
        <div class="mb-3 col-md-6">
          <label for="fName" class="form-label">First Name </label>
          <input
            type="text"
            class="form-control"
            id="fName"
            v-model="fName"
            required
            :class="{ 'is-invalid': fNameError }"
          />
          <div class="invalid-feedback">First name is required.</div>
        </div>
        <div class="mb-3 col-md-6">
          <label for="lName" class="form-label">Last Name</label>
          <input
            type="text"
            class="form-control"
            id="lName"
            v-model="lName"
            required
            :class="{ 'is-invalid': lNameError }"
          />
          <div class="invalid-feedback">Last name is required.</div>
        </div>
      </div>
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input
          type="email"
          class="form-control"
          id="email"
          v-model="email"
          required
          :class="{ 'is-invalid': emailError }"
        />
        <div class="invalid-feedback">Valid email is required.</div>
      </div>
      <label for="password" class="form-label">Password</label>
      <div class="input-group mb-3">
        <input
          :type="showPassword ? 'text' : 'password'"
          class="form-control"
          id="password"
          v-model="password"
          required
          :class="{ 'is-invalid': passwordError }"
        />
        <div class="input-group-append">
          <span
            type="button"
            class="input-group-text"
            @click="togglePasswordVisibility"
            id="basic-addon2"
            style="
              background-color: #e9ecef;
              border-top-left-radius: 0px;
              border-bottom-left-radius: 0px;
            "
          >
            <i
              :class="showPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'"
            ></i>
          </span>
        </div>
        <div class="invalid-feedback">Password is required.</div>
      </div>
      <label for="confPassword" class="form-label">Confirm Password</label>
      <div class="input-group mb-3">
        <input
          :type="showConfPassword ? 'text' : 'password'"
          class="form-control"
          id="confPassword"
          v-model="confPassword"
          required
          :class="{ 'is-invalid': confPasswordError }"
        />
        <div class="input-group-append">
          <span
            type="button"
            class="input-group-text"
            @click="toggleConfPasswordVisibility"
            id="basic-addon2"
            style="
              background-color: #e9ecef;
              border-top-left-radius: 0px;
              border-bottom-left-radius: 0px;
            "
          >
            <i
              :class="
                showConfPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'
              "
            ></i>
          </span>
        </div>
        <div class="invalid-feedback">Passwords must match.</div>
      </div>
      <div class="my-4">
        <button type="submit" class="btn btn-primary w-100">SignUp</button>
      </div>
    </div>
  </form>
</template>

<script>
import Swal from "sweetalert2";
import { Register } from "../../functions/User/User.js";
export default {
  name: "RegisterForm",
  data() {
    return {
      fName: "",
      lName: "",
      email: "",
      password: "",
      confPassword: "",
      showPassword: false,
      showConfPassword: false,
      fNameError: false,
      lNameError: false,
      emailError: false,
      passwordError: false,
      confPasswordError: false,
    };
  },
  methods: {
    async signup() {
      this.validateForm();
      if (
        !this.fNameError &&
        !this.lNameError &&
        !this.emailError &&
        !this.passwordError &&
        !this.confPasswordError
      ) {
        const formData = {
          Email: this.email,
          fName: this.fName,
          lName: this.lName,
          password: this.password,
        };
        try {
          const response = await Register(formData);
          if (response.regist) {
            Swal.fire({
              title: "Success!",
              text: "You have successfully registered.",
              icon: "success",
              confirmButtonText: "OK",
            }).then(() => {
              this.$router.push({ name: "HomePage" });
            });
          } else {
            Swal.fire({
              title: "Error!",
              text: response.message || "Registration failed.",
              icon: "error",
              confirmButtonText: "OK",
            });
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: "An error occurred during registration.",
            icon: "error",
            confirmButtonText: "OK",
          });
        }
      }
    },
    validateForm() {
      this.fNameError = this.fName.trim() === "";
      this.lNameError = this.lName.trim() === "";
      this.emailError = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
      this.passwordError = this.password.trim() === "";
      this.checkPasswordsMatch();
    },
    checkPasswordsMatch() {
      this.confPasswordError = this.confPassword !== this.password;
    },
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    },
    toggleConfPasswordVisibility() {
      this.showConfPassword = !this.showConfPassword;
    },
  },
};
</script>

<style scoped>
/* Remove unnecessary scoped styles */
</style>
