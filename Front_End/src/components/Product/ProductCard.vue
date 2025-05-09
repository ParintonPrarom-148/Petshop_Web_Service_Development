<template>
  <router-link
    :to="{
      name: 'ProductDetailPage',
      params: { id: product.product_id },
    }"
    class="card text-center"
    style="width: 20rem"
  >
    <b-skeleton-wrapper :loading="loading">
      <template #loading>
        <b-skeleton
          type="image"
          width="100%"
          height="180px"
          style="max-height: 30vh; min-height: 30vh"
        />
        <div class="container mt-3">
          <b-skeleton width="80%" />
          <b-skeleton width="60%" />
        </div>
      </template>
      <img
        :src="
          product.product_image
            ? `data:image/png;base64,${product.product_image}`
            : 'https://via.placeholder.com/150'
        "
        class="card-img-top"
        alt="404 Not found"
        style="max-height: 45vh; min-height: 45vh"
      />
      <div class="card-body">
        <h1 class="card-title text-start fs-6 fw-bold mt-3">
          {{ product.product_name }}
        </h1>
        <p class="card-text text-start fs-6">
          {{ product.product_price }} ฿ THB
        </p>
        <!-- <div class="d-flex justify-content-end">
          <a
            href="/Products/Detail/{{ name }}"
            class="stretched-link"
            @click="handleCardClick"
          ></a>
        </div> -->
      </div>
    </b-skeleton-wrapper>
  </router-link>
</template>

<script>
import {
  BCard,
  BSkeletonWrapper,
  BCardBody,
  BCardTitle,
  BCardText,
  BButton,
  BImg,
} from "bootstrap-vue-3";

export default {
  name: "ProductCard",
  components: {
    BCard,
    BSkeletonWrapper,
    BCardBody,
    BCardTitle,
    BCardText,
    BButton,
    BImg,
  },
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      loading: true, // Set this to false when data is loaded
    };
  },
  mounted() {
    // Simulate data loading
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  },

  methods: {
    handleCardClick() {
      console.log(`Product Name: ${this.product.product_name}`);
      console.log(`Product Price: ${this.product.product_price} ฿ THB`);
      console.log(`Product Image: ${this.product.product_image}`);
    },
  },
};
</script>

<style scoped>
.card {
  position: relative;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: 0.4s;
}
.card:hover {
  transform: translateY(-5px);
  /* top: -5px; */
}

.custom-card {
  position: relative;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
}
</style>