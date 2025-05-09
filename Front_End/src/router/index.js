import { onMounted } from "vue";
import { createRouter, createWebHistory, useRouter } from "vue-router";

import Login from "../page/Login/page.vue";
import HomePage from "../page/Home/page.vue";
import ProductPage from "../page/Product/page.vue";
import ProductDetailPage from "../page/Product/ProductDetail/page.vue";
import CartPage from "../page/Cart/page.vue";
import ProfilePage from "../components/Settings/ProfilePage.vue";
import ChangePwdPage from "../components/Settings/FormChangePwd.vue";
import ManageProductPage from "../components/Settings/ManageProductPage.vue";
import AddProductPage from "../components/Settings/AddProductPage.vue";
import SettingsPage from "../page/Settings/page.vue";
import MainLayout from "../MainLayout.vue";
import NotFound from "../page/NotFound.vue";
import CartHistory from "@/components/Settings/CartHistory.vue";
import CartHistoryDetail from "../page/Cart/CartHistoryDetail/page.vue";
import EditProductPage from "@/components/Settings/EditProductPage.vue";

const routes = [
  {
    path: "/",
    component: MainLayout,
    redirect: "/",
    children: [
      {
        path: "/",
        name: "HomePage",
        component: HomePage,
      },
      {
        path: "/Products",
        name: "ProductPage",
        component: ProductPage,
      },
      {
        path: "/Products/Detail/:id",
        name: "ProductDetailPage",
        component: ProductDetailPage,
        props: true,
      },
      {
        path: "/Cart",
        name: "CartPage",
        component: CartPage,
      },
      {
        path: "/Settings",
        name: "SettingsPage",
        component: SettingsPage,
        children: [
          {
            path: "/Settings/Profile",
            name: "ProfilePage",
            component: ProfilePage,
          },
          {
            path: "/Settings/Change-Password",
            name: "ChangePwdPage",
            component: ChangePwdPage,
          },
          {
            path: "/Settings/Manage-Product",
            name: "ManageProductPage",
            component: ManageProductPage,
          },
          {
            path: "/Settings/Cart-History",
            name: "CartHistory",
            component: CartHistory,
            children: [],
          },
          {
            path: "/Settings/Add-Product",
            name: "AddProductPage",
            component: AddProductPage,
          },
          {
            path: "/Settings/Cart-History/Detail/:cartId",
            name: "CartHistoryDetail",
            component: CartHistoryDetail,
            props: true,
          },
          {
            path: "/Settings/edit-product/:id",
            name: "EditProductPage",
            component: EditProductPage,
            props: true, // Pass product as a prop
          },
        ],
      },
      {
        path: "/:pathMatch(.*)*",
        name: "NotFound",
        component: NotFound,
      },
    ],
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});
export default router;
