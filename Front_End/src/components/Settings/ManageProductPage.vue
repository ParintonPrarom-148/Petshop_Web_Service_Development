<template>
  <div v-if="this.isAuthorized" class="container">
    <h2 class="pb-3">Manage Product</h2>
    <form @submit.prevent="submitForm">
      <div class="row py-3">
        <div class="col-md-3">
          <label class="form-label">ชื่อสินค้า</label>
          <input
            class="form-control"
            type="text"
            v-model="productName"
            placeholder="ชื่อสินค้า"
          />
        </div>
        <div class="col-md-2">
          <label for="productType" class="form-label">ประเภทสินค้า</label>
          <select id="productType" class="form-select" v-model="productType">
            <option value="" selected>กรุณาเลือก</option>
            <option
              v-for="type in productTypesData"
              :key="type.id"
              :value="type.product_type_id"
            >
              {{ type.product_type_name }}
            </option>
          </select>
        </div>

        <div class="col-md-1 d-flex align-items-end">
          <button
            type="button"
            class="btn btn-secondary w-100"
            @click="resetForm"
          >
            Reset
          </button>
        </div>
        <div class="col d-flex align-items-end justify-content-end">
          <router-link :to="{ name: 'AddProductPage' }">
            <button type="submit" class="btn btn-primary">
              <i class="bi bi-plus-circle"></i>
              Add Product
            </button>
          </router-link>
        </div>
      </div>
    </form>

    <div
      class="card-body overflow-auto"
      style="max-height: 100vh; padding-left: 0px"
    >
      <div v-for="product in filteredProducts" :key="product.product_id">
        <ManageProductCard :product="product" />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from "vue";
import ManageProductCard from "./ManageProductCard.vue";
import { GetProducts } from "@/functions/Product/Product";
import { GetProductTypes } from "@/functions/MasterData/MasterData";
import { getCookie } from "@/functions/Cookie/Cookie";
import NotFound from "@/page/NotFound.vue";
import router from "@/router";

export default {
  name: "ManageProductPage",
  components: { ManageProductCard, NotFound },
  data() {
    return {
      productTypesData: ref([]),
      originalProducts: ref([]), // เก็บข้อมูลต้นฉบับ
      productName: "",
      productType: "",
      isAuthorized: false,
      token: null,
    };
  },
  async mounted() {
    await this.fetchData();
    this.authen();
  },
  methods: {
    async authen() {
      this.token = getCookie();
      if (this.token) {
        if (this.token.roleId === 0) {
          this.isAuthorized = true;
        } else {
          this.isAuthorized = false;
          router.push({ name: "NotFound" });
        }
      } else {
        this.isAuthorized = false;
        router.push({ name: "NotFound" });
      }
    },

    async fetchData() {
      try {
        // Fetch product types
        let cacheKey = "productTypesCache";
        let cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          this.productTypesData = JSON.parse(cachedData);
        } else {
          try {
            let response = await GetProductTypes();
            this.productTypesData = response;
            localStorage.setItem(cacheKey, JSON.stringify(response));
          } catch (error) {
            console.error("Error fetching product types:", error);
          }
        }

        // Fetch products
        cacheKey = "productsCache";
        cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          this.originalProducts = JSON.parse(cachedData);
        } else {
          try {
            let response = await GetProducts();
            this.originalProducts = response;
            localStorage.setItem(cacheKey, JSON.stringify(response));
          } catch (error) {
            console.error("Error fetching products:", error);
          }
        }
      } catch (error) {
        console.error("Error in fetchData:", error);
      }
    },
    submitForm() {
      console.log("Form submitted with:", {
        productName: this.productName,
        productType: this.productType,
      });
      this.resetForm();
    },
    resetForm() {
      this.productName = "";
      this.productType = "";
    },
  },
  computed: {
    filteredProducts() {
      return this.originalProducts.filter((product) => {
        return (
          (!this.productName ||
            product.product_name
              .toLowerCase()
              .includes(this.productName.toLowerCase())) &&
          (!this.productType || product.product_type_id == this.productType)
        );
      });
    },
  },
};
</script>

<style>
</style>
