<template>
  <h2 class="pb-3">Cart History</h2>
  <!-- <pre>{{ cartHistoryDetails.cartList }}</pre> -->
  <div
    v-if="
      !cartHistoryDetails ||
      !cartHistoryDetails.cartList ||
      Object.keys(cartHistoryDetails.cartList).length === 0
    "
  >
    <p>ไม่มีประวัติการซื้อสินค้า</p>
  </div>
  <div
    v-else
    v-for="(cart, cartId) in cartHistoryDetails.cartList"
    :key="cartId"
    class="mb-3"
  >
    <CartHistoryCard :cartId="cartId" :qty="cart.qty" :total="cart.total" />
  </div>
</template>

<script>
import { ref } from "vue";

import { EventBus } from "@/event-bus";
import { getCartHistoryDtl } from "@/functions/Cart/Cart";
import CartHistoryCard from "./CartHistoryCard.vue";
export default {
  name: "CartHistory",
  components: {
    CartHistoryCard,
  },
  data() {
    return {
      cartHistoryDetails: {},
    };
  },
  mounted() {
    this.getCartHistoryDtl();

    // Listen to the confirm-cart event
    EventBus.on("confirm-cart", this.handleConfirmCart);
  },
  unmounted() {
    // Cleanup the event listener
    EventBus.off("confirm-cart", this.handleConfirmCart);
  },

  methods: {
    async getCartHistoryDtl() {
      let cartHistoryDetails = localStorage.getItem("cartHistoryDetails");
      if (cartHistoryDetails) {
        this.cartHistoryDetails = JSON.parse(cartHistoryDetails).data;
        console.log("Loaded from cache:", this.cartHistoryDetails);
      } else {
        try {
          const res = await getCartHistoryDtl();
          localStorage.setItem("cartHistoryDetails", JSON.stringify(res));
          this.cartHistoryDetails = res.data;
          console.log(this.cartHistoryDetails);
          console.log("Fetched from API:", this.cartHistoryDetails);
        } catch (error) {
          console.error("Error fetching cart history details:", error);
        }
      }
    },
  },

  handleConfirmCart() {
    console.log("confirm-cart event received. Clearing cart history cache.");
    localStorage.removeItem("cartHistoryDetails"); // Clear the cache
    this.getCartHistoryDtl(); // Reload the cart history
  },
};
</script>

<style>
</style>