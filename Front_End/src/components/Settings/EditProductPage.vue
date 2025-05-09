<template>
  <div class="container">
    <h2 class="pb-3">Edit Product</h2>

    <div class="card p-4">
      <div class="row">
        <!-- Left Section: Drag & Drop & Click Upload Box -->
        <div class="col-md-6">
          <div
            class="preview-container border rounded d-flex align-items-center justify-content-center w-100"
            style="
              height: 250px;
              cursor: pointer;
              background-color: #f8f9fa;
              text-align: center;
            "
            @dragover.prevent="dragOver"
            @dragleave="dragLeave"
            @drop.prevent="handleDrop"
            @click="openFilePicker"
            :class="{ 'drag-active': isDragging }"
          >
            <!-- Show image preview if available -->
            <img
              v-if="imageUrl || base64Image"
              :src="imageUrl || `data:image/png;base64,${base64Image}`"
              alt="Image Preview"
              class="img-thumbnail"
              style="max-height: 100%; max-width: 100%"
            />

            <!-- Show upload text if no image -->
            <span v-else class="text-muted"
              >Click or Drag & Drop to Upload</span
            >

            <!-- Hidden file input -->
            <input
              ref="fileInput"
              type="file"
              class="d-none"
              @change="previewImage"
              accept="image/*"
            />
          </div>

          <!-- Remove Image Button -->
          <div v-if="imageUrl || base64Image" class="text-center mt-2">
            <button type="button" class="btn btn-danger" @click="removeImage">
              <i class="bi bi-trash"></i> Remove
            </button>
          </div>

          <div v-if="fileInputError" class="text-danger mt-2">
            กรุณาอัปโหลดรูปภาพ
          </div>
        </div>

        <!-- Right Section: Product Details -->
        <div class="col-md-6">
          <div class="row mb-3">
            <label class="col-sm-4 col-form-label"
              >ชื่อสินค้า
              <span class="text-danger">*</span>
            </label>
            <div class="col-sm-8">
              <input
                v-model="productName"
                class="form-control"
                placeholder="Name"
                :class="{ 'is-invalid': productNameError }"
                required
              />
              <div class="invalid-feedback">กรุณากรอกชื่อสินค้า</div>
            </div>
          </div>
          <div class="row mb-3">
            <label for="productType" class="col-sm-4 form-label"
              >ประเภทสินค้า <span class="text-danger">*</span></label
            >
            <div class="col-sm-8">
              <select
                id="productType"
                class="form-select"
                v-model="productType"
                aria-label="Small select example"
                :class="{ 'is-invalid': productTypeError }"
                required
              >
                <option value="" selected>กรุณาเลือก</option>
                <option
                  v-for="type in productTypesData"
                  :key="type.id"
                  :value="type.product_type_id"
                >
                  {{ type.product_type_name }}
                </option>
              </select>
              <div class="invalid-feedback">กรุณาเลือกประเภทสินค้า</div>
            </div>
          </div>
          <div class="row mb-3">
            <label class="col-sm-4 col-form-label"
              >รายละเอียดสินค้า<span class="text-danger">*</span></label
            >
            <div class="col-sm-8">
              <textarea
                class="form-control"
                id="floatingTextarea"
                rows="5"
                v-model="productDtl"
                :class="{ 'is-invalid': productDtlError }"
                required
              ></textarea>
              <div class="invalid-feedback">กรุณากรอกรายละเอียดสินค้า</div>
            </div>
          </div>
          <div class="row mb-3">
            <label class="col-sm-4 col-form-label"
              >ราคา<span class="text-danger">*</span></label
            >
            <div class="col-sm-8">
              <div class="input-group mb-3">
                <div class="input-group-prepend">
                  <span
                    class="input-group-text"
                    style="
                      border-top-right-radius: 0px;
                      border-bottom-right-radius: 0px;
                    "
                    >฿</span
                  >
                </div>
                <input
                  v-model="productPrice"
                  class="form-control"
                  placeholder="Price"
                  :class="{ 'is-invalid': productPriceError }"
                  required
                />
                <div class="invalid-feedback">กรุณากรอกราคา</div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex justify-content-end gap-2">
            <button
              type="button"
              class="btn btn-secondary"
              @click="navigateToManageProductPage"
            >
              <i class="bi bi-x-circle"></i> Cancel
            </button>
            <button type="button" class="btn btn-warning" @click="resetForm">
              <i class="bi bi-arrow-counterclockwise"></i> Reset
            </button>
            <button type="button" class="btn btn-success" @click="validateForm">
              <i class="bi bi-check-circle"></i> Save
            </button>
          </div>
        </div>
      </div>

      <!-- Section to Display Converted Image -->
      <div v-if="convertedImageUrl" class="mt-4">
        <h3>Converted Image</h3>
        <img
          :src="convertedImageUrl"
          alt="Converted Image"
          class="img-thumbnail"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import Swal from "sweetalert2";

import { getCookie } from "@/functions/Cookie/Cookie";
import {
  AddProduct,
  GetProducts,
  UpdateProduct,
} from "@/functions/Product/Product";
import { GetProductTypes } from "@/functions/MasterData/MasterData";

export default {
  name: "AddProductPage",
  props: ["id"],
  setup() {
    const route = useRoute();
    const router = useRouter();

    const productTypesData = ref([]);
    const originalProducts = ref([]);
    const product = ref({});

    const imageUrl = ref(null);
    const selectedFile = ref(null);
    const base64Image = ref(null);
    const productName = ref("");
    const productPrice = ref(null);
    const productDtl = ref("");
    const productType = ref("");
    const isDragging = ref(false);
    const fileInput = ref(null);
    const convertedImageUrl = ref(null);

    const productNameError = ref(false);
    const productTypeError = ref(false);
    const productDtlError = ref(false);
    const productPriceError = ref(false);
    const fileInputError = ref(false);

    const isAuthorized = ref(false);

    onMounted(async () => {
      // console.log(`Mounted`);
      authen();
      fetchData();
    });

    const fetchData = async () => {
      let cacheKey = "productTypesCache";
      let cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        console.log("Using cached data");
        productTypesData.value = JSON.parse(cachedData); // Use cached data
      } else {
        try {
          const response = await GetProductTypes();
          console.log("Product Types Data:", response);
          productTypesData.value = response; // Use API response
        } catch (error) {
          console.error("Error fetching product types:", error);
        }
      }

      cacheKey = "productsCache";
      cachedData = localStorage.getItem(cacheKey);

      if (cachedData) {
        originalProducts.value = JSON.parse(cachedData);
      } else {
        originalProducts.value = await GetProducts();
      }

      // ดึงค่า id จาก route params
      const productId = route.params.id;
      console.log(`productId = ${productId}`);

      // ค้นหาสินค้าใน cache
      let foundProduct = originalProducts.value.find(
        (product) => product.product_id == parseInt(productId)
      );

      if (foundProduct) {
        product.value = foundProduct;

        productName.value = product.value.product_name;
        productPrice.value = product.value.product_price;
        productDtl.value = product.value.product_detail;
        productType.value = product.value.product_type_id;
        base64Image.value = product.value.product_image;
        imageUrl.value = null;

        console.log(product.value);
      } else {
        Swal.fire("Error!", "ไม่พบสินค้า", "error").then(() => {
          router.push({ name: "ManageProductPage" });
        });
        console.error("Product not found in cache");
      }
    };

    const authen = () => {
      const token = getCookie();
      console.log(`authen`);
      if (token) {
        if (token.roleId === 0) {
          isAuthorized.value = true;
        } else {
          isAuthorized.value = false;
          router.push({ name: "NotFound" });
        }
      } else {
        isAuthorized.value = false;
        router.push({ name: "NotFound" });
      }
    };
    // Handle file preview when uploaded via click or drag & drop
    const previewImage = (event) => {
      const file = event.target.files[0];
      if (file && file.type.startsWith("image/")) {
        selectedFile.value = file;
        imageUrl.value = URL.createObjectURL(file);
        fileInputError.value = false;
      } else {
        fileInputError.value = true;
        Swal.fire("Error!", "Please upload an image file.", "error");
      }
    };

    const handleDrop = (event) => {
      isDragging.value = false;
      const file = event.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) {
        selectedFile.value = file;
        imageUrl.value = URL.createObjectURL(file);
        fileInputError.value = false;
      } else {
        fileInputError.value = true;
        Swal.fire("Error!", "Please upload an image file.", "error");
      }
    };

    // Drag & Drop: Indicate active drag state
    const dragOver = () => {
      isDragging.value = true;
    };

    // Drag & Drop: Remove active state
    const dragLeave = () => {
      isDragging.value = false;
    };

    // Open File Picker when clicking the container
    const openFilePicker = () => {
      fileInput.value.click();
    };

    // Remove image preview
    const removeImage = () => {
      imageUrl.value = null;
      base64Image.value = null;
      selectedFile.value = null;
    };

    const resetForm = () => {
      imageUrl.value = null;
      base64Image.value = product.value.product_image || null;
      selectedFile.value = null;
      productName.value = product.value.product_name || "";
      productPrice.value = product.value.product_price || null;
      productDtl.value = product.value.product_detail || "";
      productType.value = product.value.product_type_id || "";
      convertedImageUrl.value = null;
      fileInputError.value = false;
      productNameError.value = false;
      productTypeError.value = false;
      productDtlError.value = false;
      productPriceError.value = false;
    };

    const convertToBlob = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const blob = new Blob([reader.result], { type: file.type });
          resolve(blob);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
    };

    function blobToBase64(blob) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => resolve(reader.result.split(",")[1]); // ตัด `data:image/png;base64,` ออก
        reader.onerror = reject;
      });
    }

    const base64ToImage = (base64) => {
      return `data:image/png;base64,${base64}`;
    };

    const uploadImage = async (file) => {
      const blob = await convertToBlob(file);
      const base64 = await blobToBase64(blob);
      console.log(`base64`, base64);
      console.log(`blob`, blob);

      return { base64: base64, blob: blob };
    };

    const saveProduct = async () => {
      const productData = {
        product_name: productName.value,
        product_detail: productDtl.value,
        product_image: base64Image.value,
        product_type_id: productType.value,
        product_price: productPrice.value,
        product_id: product.value.product_id,
      };
      console.log(`productData`, productData);

      // Convert base64 back to image URL for testing
      // convertedImageUrl.value = base64ToImage(uploadedImageUrl.base64);
      // console.log(`convertedImageUrl`, convertedImageUrl.value);

      try {
        const response = await UpdateProduct(productData);
        if (response.status === 200) {
          Swal.fire("Saved!", "Your product has been added.", "success");
          fetchData();
          resetForm();
        } else {
          Swal.fire("Error!", response.data.error, "error");
        }
      } catch (error) {
        Swal.fire("Error!", error.response.data.error, "error");
        console.error("Error saving product:", error);
      }
    };

    const validateForm = async () => {
      productNameError.value = !productName.value;
      productTypeError.value = !productType.value;
      productDtlError.value = !productDtl.value;
      productPriceError.value =
        !productPrice.value || isNaN(productPrice.value);
      fileInputError.value = !base64Image.value && !selectedFile.value;

      if (
        productNameError.value ||
        productTypeError.value ||
        productDtlError.value ||
        productPriceError.value ||
        fileInputError.value
      ) {
        return false;
      } else {
        if (selectedFile.value) {
          console.log(selectedFile.value);
          const uploadedImageUrl = await uploadImage(selectedFile.value);
          imageUrl.value = uploadedImageUrl.base64;
          base64Image.value = uploadedImageUrl.base64;
        }

        console.log(`product_image: `, imageUrl.value);
        await saveProduct();
      }
    };
    const navigateToManageProductPage = () => {
      router.push({ name: "ManageProductPage" });
    };
    return {
      productTypesData,
      imageUrl,
      productName,
      productPrice,
      productDtl,
      productType,
      base64Image,
      saveProduct,
      resetForm,
      previewImage,
      removeImage,
      handleDrop,
      dragOver,
      dragLeave,
      openFilePicker,
      isDragging,
      fileInput,
      convertedImageUrl,
      productNameError,
      productTypeError,
      productDtlError,
      productPriceError,
      fileInputError,
      validateForm,
      fetchData,
      authen,
      navigateToManageProductPage,
    };
  },
};
</script>

<style>
/* Add slight background change when dragging over the box */
.preview-container.drag-active {
  background-color: #e9ecef;
  border: 2px dashed #007bff;
  transition: background-color 0.3s, border 0.3s;
}
</style>