<template>
  <router-link
    :to="{ name: 'CartHistoryDetail', params: { cartId: cartId } }"
    class="card text-center"
  >
    <div class="p-3">
      <div class="row">
        <div
          class="col-md-9 text-start d-flex flex-column justify-content-center"
        >
          <h5>{{ cartId }}</h5>
          <p>จำนวน {{ qty }} รายการ</p>
          <p>ราคาสุทธิ {{ total }} บาท</p>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script>
export default {
  name: "CartHistoryCard",
  props: {
    cartId: {
      type: String,
      required: true,
    },
    qty: {
      type: [String, Number],
      required: true,
    },
    total: {
      type: [String, Number],
      required: true,
    },
  },
};
</script>

<style>
.card {
  position: relative;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}
</style>