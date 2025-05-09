<template>
  <div class="container">
    <table class="table table-hover mt-3">
      <thead>
        <tr class="bg-secondary bg-opacity-10">
          <td></td>
          <td></td>
          <td>สินค้า</td>
          <td class="text-end">ราคาต่อหน่วย</td>
          <td class="text-center">จำนวน</td>
          <td class="text-end">เป็นเงิน</td>
          <td></td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(ctd, pdId) in cartDtl" :key="pdId">
          <td>{{ ctd.row_number }}</td>
          <td><!-- {{ ctd.pdId }} --></td>
          <td>{{ ctd.pdName }}</td>
          <td class="text-end">{{ ctd.price }}</td>
          <td class="text-center">
            <button
              class="btn btn-sm btn-outline-secondary"
              @click="decreaseQty(ctd.pdId)"
            >
              -
            </button>
            <span class="mx-2">{{ ctd.qty }}</span>
            <button
              class="btn btn-sm btn-outline-secondary"
              @click="increaseQty(ctd.pdId)"
            >
              +
            </button>
          </td>
          <td class="text-end">
            {{ (ctd.price * ctd.qty ?? 0).toLocaleString() }}
          </td>
          <td class="text-center">
            <button
              type="button"
              class="btn btn-danger bi bi-trash"
              @click="removeItem(ctd.pdId)"
            ></button>
          </td>
        </tr>
      </tbody>
    </table>
    <!-- Total Section -->
    <div class="mt-3 text-end">
      <p><strong>รวมจำนวนสินค้า:</strong> {{ totalQty }}</p>
      <p><strong>รวมเป็นเงิน:</strong> {{ totalPrice.toLocaleString() }} บาท</p>
      <button class="btn btn-danger me-2" @click="removeCart">
        ลบตะกร้าสินค้า
      </button>
      <button class="btn btn-success" @click="proceedToBuy">สั่งซื้อ</button>
    </div>
  </div>
</template>

<script>
import Swal from "sweetalert2";
import axios from "axios";
axios.defaults.withCredentials = true;

import {
  getCartDtl,
  updateCartItemQty,
  delCartItem,
  delCart,
  confirmCart,
  getCartHistoryDtl,
} from "@/functions/Cart/Cart";
import { getCookie } from "@/functions/Cookie/Cookie";

export default {
  name: "CartPage",
  data() {
    return {
      cart: [], 
      cartDtl: [], 
      cartId: null,
      memEmail: null, // Email ผู้ใช้ที่ล็อกอิน
      cusId: null, // Email เจ้าของตะกร้า
      isAuthorized: false, // ตรวจสอบสิทธิ์
    };
  },
  computed: {
    totalQty() {
      return this.cartDtl.reduce((sum, item) => sum + item.qty, 0);
    },
    totalPrice() {
      return this.cartDtl.reduce((sum, item) => sum + item.total, 0);
    },
  },
  async mounted() {
    console.log("Fetching cart data");

    this.decodedToken = getCookie();

    if (!this.cart.length) {
      // ป้องกันการโหลดซ้ำ
      const result = await getCartDtl();
      this.cart = result.data;

      const cartList = this.cart.cartList;
      if (cartList && Object.keys(cartList).length > 0) {
        this.cartId = Object.keys(cartList)[0];
        this.cartDtl = Object.entries(cartList).flatMap(([cartId, cartData]) =>
          Object.values(cartData.productList).map((product, index) => ({
            row_number: index + 1,
            pdId: product.product_id,
            pdName: product.product_name,
            price: product.price,
            qty: product.qty,
            total: product.price * product.qty,
          }))
        );
      }
    }
  },
  methods: {
    async checkAuthorization() {
      try {
        this.memEmail = (await getCookie())?.email; // ดึง email จาก token
        const result = await getCartDtl();
        this.cart = result.data;

        // ดึง email เจ้าของตะกร้า (สมมติว่าอยู่ใน result.data.cusId)
        this.cusId = this.cart.cusId;

        // ตรวจสอบสิทธิ์
        if (this.memEmail && this.memEmail === this.cusId) {
          this.isAuthorized = true;
          this.loadCartData();
        } else {
          this.isAuthorized = false;
        }
      } catch (error) {
        console.error("Error checking authorization:", error);
        this.isAuthorized = false;
      }
    },
    loadCartData() {
      if (!this.isAuthorized) return;
      
      const cartList = this.cart.cartList;
      this.cartId = Object.keys(cartList)[0];
      this.cartDtl = Object.entries(cartList).flatMap(([cartId, cartData]) =>
        Object.values(cartData.productList).map((product, index) => ({
          row_number: index + 1,
          pdId: product.product_id,
          pdName: product.product_name,
          price: product.price,
          qty: product.qty,
          total: product.price * product.qty, 
        }))
      );
    },
    increaseQty(pdId) {
      const product = this.cartDtl.find((item) => item.pdId === pdId);
      if (product) {
        product.qty += 1;
        product.total = product.price * product.qty;
        const data = {
          product_id: product.pdId,
          qty: product.qty,
          cart_id: this.cartId,
        };
        console.log(data);
        updateCartItemQty(data);
        // this.updateCart(); // อัปเดทตะกร้าทันที
      }
    },
    decreaseQty(pdId) {
      const product = this.cartDtl.find((item) => item.pdId === pdId);
      if (product && product.qty > 1) {
        product.qty -= 1;
        product.total = product.price * product.qty;
        const data = {
          product_id: product.pdId,
          qty: product.qty,
          cart_id: this.cartId,
        };
        console.log(data);
        updateCartItemQty(data);
        // this.updateCart(); // อัปเดทตะกร้าทันที
      }
    },
    removeItem(pdId) {
      Swal.fire({
        title: "คุณต้องการลบสินค้านี้หรือไม่?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ใช่, ลบเลย!",
        cancelButtonText: "ยกเลิก",
      }).then((result) => {
        if (result.isConfirmed) {
          this.cartDtl = this.cartDtl.filter((item) => item.pdId !== pdId);
          const data = {
            product_id: pdId,
            cart_id: this.cartId,
          };
          delCartItem(data);
          // this.updateCart();
          Swal.fire("ลบสำเร็จ!", "สินค้าถูกลบออกจากตะกร้าแล้ว", "success");
        }
      });
    },
    removeCart() {
      Swal.fire({
        title: "คุณต้องการลบตะกร้าสินค้าหรือไม่?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ใช่, ลบเลย!",
        cancelButtonText: "ยกเลิก",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const res = await delCart({ cart_id: this.cartId });
          if (res.status === 200) {
            this.cartDtl = [];
            this.cart = [];
            Swal.fire("ลบสำเร็จ!", "ตะกร้าสินค้าของคุณถูกลบแล้ว", "success");
          } else {
            Swal.fire("ลบไม่สำเร็จ!", res.error, "error");
          }
        }
      });
    },
    proceedToBuy() {
      Swal.fire({
        title: "คุณต้องการดำเนินการสั่งซื้อหรือไม่?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "ใช่, สั่งซื้อเลย!",
        cancelButtonText: "ยกเลิก",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const data = {
            cart_id: this.cartId,
          };
          console.table(data);

          const result = await confirmCart(data);
          if (result.status == 200) {
            Swal.fire({
              title: "ดำเนินการสั่งซื้อสำเร็จ!",
              icon: "success",
              confirmButtonText: "ตกลง",
            }).then(() => {
              this.$router.push({ name: "CartHistory" });
            });
          }
        } else {
          // Optional: Handle cancellation
        }
      });
    },
  },
};
</script>
  <style>
.table th {
  font-weight: 500;
}
.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.03);
}
</style>
