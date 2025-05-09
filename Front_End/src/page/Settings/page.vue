<template>
  <div v-if="isAuthorized" class="bg-gray-200 min-vh-100">
    <div class="p-4 d-flex justify-content-center">
      <div class="row card w-100">
        <div class="card-body">
          <div class="row" style="padding-top: 0vh">
            <div class="col-md-3 my-4" style="padding-top: 0vh">
              <div class="mt-5 list-group list-group-flush">
                <router-link
                  v-if="token.roleId === 0"
                  to="/Settings/Manage-Product"
                  class="list-group-item list-group-item-action"
                  >Manage Product</router-link
                >
                <router-link
                  to="/Settings/Profile"
                  class="list-group-item list-group-item-action"
                  >Profile</router-link
                >
                <router-link
                  to="/Settings/change-password"
                  class="list-group-item list-group-item-action"
                  >Change Password</router-link
                >
                <router-link
                  to="/Settings/Cart-History"
                  class="list-group-item list-group-item-action"
                  >Cart history</router-link
                >
              </div>
            </div>
            <div class="col-md-9 my-2">
              <router-view />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <NotFound v-else />
</template>

<script>
import { getCookie } from "@/functions/Cookie/Cookie";
import NotFound from "@/page/NotFound.vue";

export default {
  name: "SettingsPage",
  components: {
    NotFound,
  },
  data() {
    return {
      isAuthorized: false,
      token: null,
    };
  },
  mounted() {
    this.token = getCookie();
    console.log("Token object:", this.token); // Debug log

    // ตรวจสอบทั้ง token และค่าที่จำเป็นใน token
    this.isAuthorized =
      this.token &&
      typeof this.token === "object" &&
      this.token.roleId !== undefined;

    console.log(`Authorization status: ${this.isAuthorized}`);

    // ถ้าไม่ได้รับอนุญาต ให้ redirect ไปหน้า login
    if (!this.isAuthorized) {
      console.warn("Unauthorized access, redirecting...");
      // this.$router.push("/login"); // หรือแสดง NotFound ตามที่คุณต้องการ
    }
  },
};
</script>

<style>
.bg-gray-200 {
  background-color: #f3f3f3;
}

/* เพิ่มสไตล์สำหรับเมนู */
.list-group-item-action {
  transition: all 0.2s;
}
.list-group-item-action:hover {
  background-color: #f8f9fa;
}
.list-group-item-action.router-link-exact-active {
  background-color: #e9ecef;
  font-weight: 500;
}
</style>