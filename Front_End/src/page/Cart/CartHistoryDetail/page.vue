<template>
  <div class="container">
    <router-link
      :to="{ name: 'CartHistory' }"
      class="btn btn-outline-secondary mb-4"
    >
      <i class="bi bi-chevron-left"></i> กลับสู่หน้ารายการตะกร้า
    </router-link>
    <div v-if="isLoading" class="text-center my-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="!formattedProducts.length" class="alert alert-warning mt-5">
      ไม่พบข้อมูลสินค้าในตะกร้า
    </div>

    <div v-else>
      <h4 class="mb-4">เลขที่ตะกร้า: {{ cartId }}</h4>

      <table class="table table-hover mt-3">
        <thead>
          <tr class="bg-secondary bg-opacity-10">
            <th width="5%">#</th>
            <th>สินค้า</th>
            <th width="15%" class="text-end">ราคาต่อหน่วย</th>
            <th width="15%" class="text-center">จำนวน</th>
            <th width="15%" class="text-end">เป็นเงิน</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in formattedProducts"
            :key="`${product.product_id}-${product.rowNumber}`"
          >
            <td>{{ product.rowNumber }}</td>
            <td>{{ product.product_name }}</td>
            <td class="text-end">{{ formatCurrency(product.price) }}</td>
            <td class="text-center">{{ product.qty }}</td>
            <td class="text-end">
              {{ formatCurrency(product.price * product.qty) }}
            </td>
          </tr>
        </tbody>
      </table>

      <div class="mt-4 text-end">
        <h5>รวมเป็นเงิน: {{ formatCurrency(calculateTotal()) }} บาท</h5>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const cartId = ref(route.params.cartId);
const cartData = ref(null);
const isLoading = ref(false);

const formattedProducts = computed(() => {
  if (!cartData.value?.productList) return [];

  return Object.values(cartData.value.productList).map((product, index) => ({
    ...product,
    rowNumber: index + 1,
  }));
});

const fetchCartData = async () => {
  isLoading.value = true;
  try {
    const cartHistoryDetails = JSON.parse(
      localStorage.getItem("cartHistoryDetails")
    ).data;

    if (cartHistoryDetails?.cartList?.[cartId.value]) {
      cartData.value = cartHistoryDetails.cartList[cartId.value];
    }
  } catch (error) {
    console.error("Error fetching cart data:", error);
  } finally {
    isLoading.value = false;
  }
};

const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return num.toLocaleString("th-TH", {
    style: "decimal",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const calculateTotal = () => {
  return formattedProducts.value.reduce(
    (sum, product) => sum + product.price * product.qty,
    0
  );
};

onMounted(() => {
  fetchCartData();
});
</script>

<style scoped>
.table th {
  font-weight: 500;
}
.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
