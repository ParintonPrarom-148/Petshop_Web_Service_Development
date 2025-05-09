<template>
  <div class="container">
    <h2 class="pb-3">Profile</h2>
    <div class="card p-4">
      <PersonalCard />
    </div>
  </div>
</template>
  
<script>

import PersonalCard from "./PersonalCard.vue";
export default {
  name: "ProfilePage",
  components: {
    PersonalCard,
  },
  data() {
    return {
      isEditing: false,
    };
  },
  methods: {},
};
</script>
  
<style scoped>
/* Add your styles here */
</style>