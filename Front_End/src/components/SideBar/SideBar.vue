<template>
  <nav
    :class="[
      'navbar',
      'navbar-expand-lg',
      'bg-white',
      { 'sticky-top': isSticky, 'navbar-transparent': isTransparent },
    ]"
  >
    <div class="container-fluid">
      <button
        class="navbar-toggler"
        type="button"
        data-bs-toggle="offcanvas"
        data-bs-target="#offcanvasNavbar"
        aria-controls="offcanvasNavbar"
      >
        <span class="navbar-toggler-icon"></span>
      </button>
      <router-link :to="{ name: 'HomePage' }" class="navbar-brand">
        <img src="@/assets/logoPetShop.png" alt="Logo" class="nav-logo" />
      </router-link>

      <div class="d-flex align-items-center">
        <router-link
          :to="decodedToken ? { name: 'CartPage' } : { name: 'Login' }"
          class="nav-link position-relative d-lg-none"
        >
          <i class="bi bi-cart fs-4"></i>
          <span
            v-if="totalCartQty > 0 && decodedToken"
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
          >
            {{ totalCartQty }}
            <span class="visually-hidden">unread messages</span>
          </span>
        </router-link>
      </div>

      <div
        class="offcanvas offcanvas-start"
        tabindex="-1"
        id="offcanvasNavbar"
        aria-labelledby="offcanvasNavbarLabel"
      >
        <div class="offcanvas-header">
          <h5 class="offcanvas-title" id="offcanvasNavbarLabel">KU Pet Shop</h5>
          <button
            type="button"
            class="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>

        <div class="offcanvas-body">
          <ul class="navbar-nav mx-auto fs-5 fw-bold">
            <li class="nav-item">
              <router-link
                :to="{ name: 'HomePage' }"
                class="nav-link"
                exact-path
              >
                HOME
              </router-link>
            </li>
            <li class="nav-item">
              <router-link
                :to="{ name: 'ProductPage' }"
                class="nav-link"
                exact-path
              >
                PRODUCT
              </router-link>
            </li>
            <!-- Add more nav items here -->
          </ul>

          <div class="d-flex align-items-center gap-3">
            <router-link
              :to="decodedToken ? { name: 'CartPage' } : { name: 'Login' }"
              class="nav-link position-relative d-lg-block d-none"
            >
              <i class="bi bi-cart fs-4"></i>
              <span
                v-if="totalCartQty > 0 && decodedToken"
                class="position-absolute start-100 translate-middle badge rounded-pill bg-danger"
              >
                {{ totalCartQty }}
                <span class="visually-hidden">unread messages</span>
              </span>
            </router-link>

            <div class="my-auto d-lg-block d-none">
              <template v-if="decodedToken">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  id="accountDropdown"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="bi bi-person-circle fs-4"></i>
                  {{ user.fname }}
                </a>
                <ul
                  class="dropdown-menu dropdown-menu-end"
                  aria-labelledby="accountDropdown"
                >
                  <li class="dropdown-header" @click.stop>
                    <strong>{{ user.fname }} {{ user.lname }}</strong> <br />
                    <small class="text-muted">{{ user.email }}</small>
                  </li>
                  <li><hr class="dropdown-divider" /></li>
                  <li>
                    <router-link
                      :to="{ name: 'ProfilePage' }"
                      class="dropdown-item"
                    >
                      <i class="bi bi-gear"></i> Settings
                    </router-link>
                  </li>
                  <li>
                    <button class="dropdown-item" @click="handleLogout">
                      <i class="bi bi-box-arrow-right"></i> Logout
                    </button>
                  </li>
                </ul>
              </template>

              <template v-else>
                <router-link :to="{ name: 'Login' }" class="nav-link">
                  Login
                </router-link>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>


<script >
import { ref, onMounted, onUnmounted, watchEffect, watch } from "vue"; // Add 'watch'
import { Dropdown } from "bootstrap";
import { getCookie } from "@/functions/Cookie/Cookie";
import { EventBus } from "@/event-bus";
import { Logout } from "@/functions/User/User";
import { getCartDtl } from "@/functions/Cart/Cart";

export default {
  name: "Navbar",
  data() {
    return {
      user: ref({
        fname: "",
        lname: "",
        email: "",
        role: "",
      }),
      isSticky: ref(false),
      isTransparent: ref(false),
      decodedToken: ref(getCookie()),
      cartList: ref([]),
    };
  },
  computed: {
    totalCartQty() {
      // Use the qty field directly from cartList
      return Object.values(this.cartList).reduce((total, cart) => {
        return total + parseInt(cart.qty, 10); // Sum up the qty values
      }, 0);
    },
  },
  methods: {
    handleScroll() {
      if (window.scrollY > 2) {
        this.isSticky = true;
        this.isTransparent = true;
      } else {
        this.isSticky = false;
        this.isTransparent = false;
      }
    },
    handleLogout() {
      console.log(`call logout`);
      Logout();
      EventBus.emit("logout"); // Notify other components
    },
    async updateUserData() {
      this.decodedToken = getCookie(); // Get the latest token
      if (this.decodedToken) {
        this.user.fname = this.decodedToken.fName;
        this.user.lname = this.decodedToken.lName;
        this.user.email = this.decodedToken.Email;
        this.user.role = this.decodedToken.roleEN;

        const cachedCartDetails = localStorage.getItem("cartDetails");
        if (cachedCartDetails) {
          console.log("Using cached cart details");
          const cacheData = JSON.parse(cachedCartDetails);
          this.cartList = cacheData.cartList;
          // console.table(this.cartList);
        } else {
          console.log("Fetching cart details from API");
          try {
            const response = await getCartDtl();
            if (response.status === 200) {
              this.cartList = response.data.cartList;
              // console.table(this.cartList);
              localStorage.setItem(
                "cartDetails",
                JSON.stringify(response.data)
              ); // Cache the data
            }
          } catch (error) {
            console.error("Error fetching cart details:", error);
          }
        }
      } else {
        this.user = { fname: "", lname: "", email: "", role: "" }; // Clear data on logout
      }
    },
  },
  mounted() {
    this.updateUserData(); // Fetch user info on mount

    window.addEventListener("scroll", this.handleScroll);
    const dropdownElement = document.getElementById("accountDropdown");
    if (dropdownElement) {
      new Dropdown(dropdownElement); // Enable Bootstrap dropdown functionality
    }

    // Watch for logout event
    EventBus.on("logout", () => {
      this.updateUserData(); // Update component when logout event occurs
    });
    EventBus.on("updated-cart", () => {
      this.updateUserData();
    });

    // Watch for changes in decodedToken
    watch(
      () => this.decodedToken,
      () => {
        this.updateUserData();
      }
    );
  },
  unmounted() {
    window.removeEventListener("scroll", this.handleScroll);
    EventBus.off("logout"); // Cleanup event listener
    EventBus.off("updated-cart"); // Cleanup event listener
  },
};
</script>

<style scoped>
/* Navbar Styling */
.navbar-nav .nav-link {
  color: rgb(0, 0, 0);
  transition: background-color 0.3s, color 0.3s;
}
.navbar-nav .nav-link:hover {
  color: #000000;
  text-decoration: underline;
}
.navbar-nav .nav-item > .router-link-exact-active {
  text-decoration: underline;
}
.navbar-nav .nav-item > .router-link-exact-active:hover {
  text-decoration: underline;
  text-decoration-thickness: 2px;
}

.navbar-nav .dropdown-menu .router-link-active {
  text-decoration: none;
  font-weight: normal;
}

.navbar-transparent {
  /* background-color: rgba(255, 255, 255, 0.8) !important; */
  /* backdrop-filter: blur(5px); */
  /* transition: background-color 0.3s; */
}

.nav-logo {
  width: 50px;
  height: 50px;
}
</style>