<script setup>
import { onMounted } from "vue";
import { useRouter } from "vue-router";

// const router = useRouter();

// onMounted(() => {
//   if (router.currentRoute.value.path === "/") {
//     router.push({ name: "HelloWo2rld" });
//   }
// });
</script>

<template><router-view /></template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
