<template>
  <div class="flex">
    <SideBar />
    <div class="">
      <router-view />
    </div>
  </div>
</template>
  
<script setup>
import { useRoute } from "vue-router";
import { onMounted, onUnmounted } from "vue";

import SideBar from "./components/SideBar/SideBar.vue";
import { EventBus } from "@/event-bus";

const handleUserUpdate = () => {
  window.location.reload(); // รีเฟรชทั้งหน้า
};
const route = useRoute();
onMounted(() => {
  EventBus.on("user-updated", handleUserUpdate);
});

onUnmounted(() => {
  EventBus.off("user-updated", handleUserUpdate);
});
</script>

  
<style scoped>
</style>