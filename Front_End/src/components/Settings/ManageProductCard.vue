<template>
  <div :key="product.product_id" class="card p-3 mb-3">
    <div class="row">
      <!-- <pre>{{ JSON.stringify(product, null, 2) }}</pre> -->
      <div class="col-md-3 d-flex justify-content-center align-items-center">
        <img
          :src="
            product.product_image
              ? `data:image/png;base64,${product.product_image}`
              : 'https://via.placeholder.com/150'
          "
          alt="Product Image"
          class="img-fluid"
        />
      </div>
      <div class="col-md-9 text-start">
        <h5>{{ product.product_name }}</h5>
        <p class="text-secondary">{{ product.product_detail }}</p>
        <p class="text-secondary">
          ประเภทสินค้า: {{ product.product_type_name }}
        </p>
        <p>ราคา: ฿ {{ product.product_price }}</p>
      </div>
      <div class="d-flex justify-content-end gap-2">
        <button
          type="button"
          class="btn btn-primary"
          @click="editProduct(product.product_id)"
        >
          <i class="bi bi-pencil-square"></i>
          Edit
        </button>
        <button
          type="button"
          class="btn btn-danger"
          @click="deleteProduct(product.product_id)"
        >
          <i class="bi bi-trash"></i>
          Delete
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

import Swal from "sweetalert2";

import { DelProduct } from "@/functions/Product/Product.js";

export default {
  name: "ManageProductCard",
  props: {
    product: {
      type: Object,
      required: true,
    },
  },
  methods: {
    getImageSrc(productImage) {
      if (!productImage) {
        return "https://via.placeholder.com/150"; // รูป fallback
      }

      // ตรวจสอบว่าข้อมูลเป็น Base64 หรือไม่
      if (typeof productImage === "string") {
        return `data:image/png;base64,${productImage}`;
      }

      return "https://via.placeholder.com/150"; // กัน error
    },
    editProduct(id) {
      this.$router.push({
        name: "EditProductPage",
        params: { id },
        state: { product: this.product },
      });
    },
    deleteProduct(id) {
      const data = {
        product_id: id,
      };
      // console.table(data);

      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          DelProduct(data)
            .then((response) => {
              console.log(response);
              Swal.fire(
                "Deleted!",
                "Your file has been deleted.",
                "success"
              ).then(() => {
                window.location.reload();
              });
              this.$emit("delete-product", id);
            })
            .catch((error) => {
              console.error(error);
              Swal.fire("Error!", "Something went wrong.", "error");
            });
        }
      });
    },
  },
};
</script>

<style>
.img-fluid {
  max-width: 100%;
  height: auto;
}
</style>
