<template>
  <div class="container">
    <form @submit.prevent="submitForm">
      <div class="row py-3">
        <div class="col-md-3">
          <label for="productType" class="form-label">ชื่อสินค้า</label>
          <input
            class="form-control"
            type="text"
            v-model="productName"
            placeholder="กรุณาใส่ชื่อสินค้า"
            aria-label="default input example"
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
        <div class="row g-4">
          <div
            v-for="(product, index) in filteredProducts"
            :key="index"
            class="col-lg-3 col-md-4 col-6 d-flex justify-content-center"
          >
            <ProductCard :product="product" />
          </div>
        </div>
      </div>
    </form>
  </div>
</template>


<script>
import { ref } from "vue";
import ProductCard from "@/components/Product/ProductCard.vue";
import { GetProducts } from "@/functions/Product/Product";
import { GetProductTypes } from "@/functions/MasterData/MasterData";

export default {
  name: "ProductPage",
  data() {
    return {
      productTypesData: ref([]),
      originalProducts: ref([]), // เก็บข้อมูลต้นฉบับ
      productName: "",
      productType: "",
    };
  },
  components: {
    ProductCard,
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
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