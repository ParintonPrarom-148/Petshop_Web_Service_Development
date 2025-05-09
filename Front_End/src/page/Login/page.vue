<template>
  <div class="background-gradient">
    <div
      class="container d-flex justify-content-center align-items-center vh-100"
    >
      <div class="row w-100">
        <div class="col-lg-4 col-md-8 mx-auto">
          <div class="card">
            <div class="card-body">
              <h1 class="card-title text-center">
                {{ isLogin ? "Login" : "Register" }}
              </h1>

              <!-- Ensure smooth transition -->
              <transition name="fade-scale" mode="out-in">
                <component
                  :is="isLogin ? LoginForm : RegisterForm"
                  :key="isLogin"
                />
              </transition>

              <div class="mt-3 text-center">
                <span v-if="isLogin">
                  Don't have an account?
                  <a href="#" @click.prevent="toggleForm">Register</a>
                </span>
                <span v-else>
                  Already have an account?
                  <a href="#" @click.prevent="toggleForm">Login</a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import LoginForm from "../../components/Login/LoginForm.vue";
import RegisterForm from "../../components/Register/RegisterForm.vue";

const isLogin = ref(true);

function toggleForm() {
  isLogin.value = !isLogin.value;
}
</script>

<style scoped>
/* Improved fade & scale effect */
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.fade-scale-leave-to {
  opacity: 0;
  transform: scale(1);
}
</style>
