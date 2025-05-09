<template>
  <div class="container">
    <h2 class="pb-3">Change Password</h2>
    <div class="card p-4">
      <div class="row mb-3">
        <label class="col-sm-4 col-form-label">Password</label>
        <div class="col-sm-4">
          <div class="input-group">
            <input
              :type="showOldPassword ? 'text' : 'password'"
              v-model="oldPassword"
              :class="{
                'form-control': true,
              }"
              placeholder="Password"
            />
            <div class="input-group-append">
              <span
                type="button"
                class="input-group-text"
                @click="toggleOldPasswordVisibility"
                style="
                  background-color: #e9ecef;
                  border-top-left-radius: 0px;
                  border-bottom-left-radius: 0px;
                "
              >
                <i
                  :class="
                    showOldPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'
                  "
                ></i>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div class="row mb-3">
        <label class="col-sm-4 col-form-label">New Password</label>
        <div class="col-sm-4">
          <div class="input-group">
            <input
              :type="showNewPassword ? 'text' : 'password'"
              v-model="newPassword"
              :class="{
                'form-control': true,
                'is-invalid': errNewPassword,
                'is-valid': !errNewPassword && newPassword.length > 0,
              }"
              placeholder="New Password"
            />
            <div class="input-group-append">
              <span
                type="button"
                class="input-group-text"
                @click="toggleNewPasswordVisibility"
                style="
                  background-color: #e9ecef;
                  border-top-left-radius: 0px;
                  border-bottom-left-radius: 0px;
                "
              >
                <i
                  :class="
                    showNewPassword ? 'bi bi-eye-slash-fill' : 'bi bi-eye-fill'
                  "
                ></i>
              </span>
            </div>

            <div v-if="errNewPassword" class="invalid-feedback">{{ msg }}</div>
            <div
              v-else-if="newPassword.length > 0"
              class="valid-feedback"
            ></div>
          </div>
        </div>
      </div>
      <div class="row mb-3">
        <label class="col-sm-4 col-form-label">Confirm Password</label>
        <div class="col-sm-4">
          <div class="input-group">
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              :class="{
                'form-control': true,
                'is-invalid': this.errConfirmPassword,
                'is-valid':
                  !this.errConfirmPassword &&
                  newPassword.length > 0 &&
                  confirmPassword.length > 0,
              }"
              placeholder="Confirm Password"
            />
            <div class="input-group-append">
              <span
                type="button"
                class="input-group-text"
                @click="toggleConfirmPasswordVisibility"
                style="
                  background-color: #e9ecef;
                  border-top-left-radius: 0px;
                  border-bottom-left-radius: 0px;
                "
              >
                <i
                  :class="
                    showConfirmPassword
                      ? 'bi bi-eye-slash-fill'
                      : 'bi bi-eye-fill'
                  "
                ></i>
              </span>
            </div>
            <div v-if="this.errConfirmPassword" class="invalid-feedback">
              รหัสผ่านไม่ตรงกัน กรุณากรอกใหม่อีกครั้ง
            </div>
            <div v-else class="valid-feedback"></div>
          </div>
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-sm-4"></div>
        <div class="col-sm-8">
          <div
            class="d-flex align-items-center mb-2"
            v-for="rule in passwordRules"
            :key="rule.text"
          >
            <span :class="rule.valid ? 'text-success' : 'text-danger'">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  v-if="rule.valid"
                  fill="none"
                  stroke="currentColor"
                  stroke-dasharray="24"
                  stroke-dashoffset="24"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 11l6 6l10 -10"
                >
                  <animate
                    fill="freeze"
                    attributeName="stroke-dashoffset"
                    dur="0.4s"
                    values="24;0"
                  ></animate>
                </path>
                <g
                  v-else
                  fill="none"
                  stroke="currentColor"
                  stroke-dasharray="16"
                  stroke-dashoffset="16"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                >
                  <path d="M7 7l10 10">
                    <animate
                      fill="freeze"
                      attributeName="stroke-dashoffset"
                      dur="0.4s"
                      values="16;0"
                    ></animate>
                  </path>
                  <path d="M17 7l-10 10">
                    <animate
                      fill="freeze"
                      attributeName="stroke-dashoffset"
                      begin="0.4s"
                      dur="0.4s"
                      values="16;0"
                    ></animate>
                  </path>
                </g>
              </svg>
            </span>
            <span class="text-sm text-gray-400 ml-2">{{ rule.text }}</span>
          </div>
        </div>
      </div>
      <div class="text-end">
        <button type="button" class="btn btn-secondary me-2" @click="cancel">
          <i class="bi bi-x-circle"></i> Cancel
        </button>
        <button
          type="button"
          class="btn btn-success"
          @click="save"
          :disabled="
            errOldPassword ||
            errNewPassword ||
            errConfirmPassword ||
            oldPassword.length === 0 ||
            newPassword.length === 0 ||
            confirmPassword.length === 0
          "
        >
          <i class="bi bi-check-circle"></i> Save
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import bcrypt from "bcryptjs";
import { getCookie } from "@/functions/Cookie/Cookie";
import { UpdatePassword } from "@/functions/User/User";

export default {
  name: "ChangePasswordPage",
  data() {
    return {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
      msg: "",
      deCoded: getCookie(),
      errOldPassword: false,
      errNewPassword: false,
      errConfirmPassword: false,
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
    };
  },
  computed: {
    passwordRules() {
      return [
        {
          text: "รหัสผ่านต้องประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวใหญ่ ตัวเล็ก และ ตัวเลข",
          valid:
            /[a-z]/.test(this.newPassword) &&
            /[A-Z]/.test(this.newPassword) &&
            /\d/.test(this.newPassword),
        },
        {
          text: "อักขระพิเศษที่อนุญาต @ $ ! % * ? & .",
          valid: /^[A-Za-z0-9@$!%*?&.]+$/.test(this.newPassword),
        },
        {
          text: "รหัสผ่านต้องยาว 8-20 ตัวอักษร",
          valid: /^.{8,20}$/.test(this.newPassword),
        },
      ];
    },
  },
  watch: {
    oldPassword: "validatePasswords",
    newPassword: "validatePasswords",
    confirmPassword: "validatePasswords",
  },
  methods: {
    toggleOldPasswordVisibility() {
      this.showOldPassword = !this.showOldPassword;
    },
    toggleNewPasswordVisibility() {
      this.showNewPassword = !this.showNewPassword;
    },
    toggleConfirmPasswordVisibility() {
      this.showConfirmPassword = !this.showConfirmPassword;
    },
    async compareConfPwd() {
      if (
        this.newPassword.length !== 0 &&
        this.confirmPassword.length !== 0 &&
        this.newPassword !== this.confirmPassword
      ) {
        console.log(this.errConfirmPassword);
        this.errConfirmPassword = true;
      } else {
        console.log(this.errConfirmPassword);
        this.errConfirmPassword = false;
      }
    },
    async validatePasswords() {
      if (
        this.oldPassword.length !== 0 &&
        !(await this.handleComparePassword())
      ) {
        this.msg = "รหัสผ่านไม่ถูกต้อง กรุณากรอกใหม่อีกครั้ง";
        this.errOldPassword = true;
        return false;
      }

      if (this.newPassword.length !== 0) {
        await this.compareConfPwd();
        if (!/^[A-Za-z0-9@$!%*?&.]+$/.test(this.newPassword)) {
          this.msg = "อักขระพิเศษที่อนุญาต @ $ ! % * ? & .";
          this.errNewPassword = true;
          return false;
        }
        if (
          !(
            /[a-z]/.test(this.newPassword) &&
            /[A-Z]/.test(this.newPassword) &&
            /\d/.test(this.newPassword)
          )
        ) {
          this.msg =
            "รหัสผ่านต้องประกอบด้วยตัวอักษรภาษาอังกฤษ ตัวเล็ก ตัวใหญ่ และตัวเลข อย่างน้อยประเภทละ 1 ตัว";
          this.errNewPassword = true;
          return false;
        }
        if (!/^.{8,20}$/.test(this.newPassword)) {
          this.msg = "รหัสผ่านต้องยาว 8-20 ตัวอักษร";
          this.errNewPassword = true;
          return false;
        }
      }
      // await this.compareConfPwd();
      this.errOldPassword = false;
      this.errNewPassword = false;
      // this.errConfirmPassword = false;
      this.msg = "";
      return true;
    },

    async save() {
      const isValid = await this.validatePasswords();
      if (!isValid) return;

      Swal.fire({
        title: "Are you sure?",
        text: "You are about to save your changes.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, save it!",
        cancelButtonText: "No, cancel!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const response = await UpdatePassword({
            email: this.deCoded.Email,
            password: this.newPassword,
          });
          console.log(response);
          if (response.status === 200) {
            this.oldPassword = "";
            this.newPassword = "";
            this.confirmPassword = "";
            this.errOldPassword = false;
            this.errNewPassword = false;
            this.errConfirmPassword = false;
            this.msg = "";
            Swal.fire("Saved!", "Your password has been changed.", "success");
          } else {
            Swal.fire({
              icon: "error",
              title: "Failed to change password",
              text: response.message,
            });
          }
        }
      });
    },
    cancel() {
      Swal.fire({
        title: "Are you sure?",
        text: "You are about to cancel your changes.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, cancel it!",
        cancelButtonText: "No, keep editing!",
      }).then((result) => {
        if (result.isConfirmed) {
          this.oldPassword = "";
          this.newPassword = "";
          this.confirmPassword = "";
          this.errOldPassword = false;
          this.errNewPassword = false;
          this.errConfirmPassword = false;
          this.msg = "";
        }
      });
    },
    async handleComparePassword() {
      const password = this.deCoded.password;
      try {
        const match = await bcrypt.compare(this.oldPassword, password);
        if (match) {
          console.log("Password is correct!");
          // Passwords match
          return true;
        } else {
          console.log("Password is incorrect!");
          // Passwords do not match
          return false;
        }
      } catch (error) {
        console.error("Error comparing passwords:", error);
        throw error;
      }
    },
  },
};
</script>

<style scoped>
/* Add your styles here */
</style>