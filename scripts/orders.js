import { orders } from "../data/orders.js";
import { getProduct, loadProductsFetch } from "../data/products.js";
import { cart, addToCart } from "../data/cart.js";
import formatCurrency from "./utils/money.js";
import dayjs from "https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js";

async function initPage() {
  await loadProductsFetch();
  renderOrders();
  updateCartQuantity();

  document.querySelector(".js-search-button").addEventListener("click", () => {
    const searchBar = document.querySelector(".js-search-bar");
    const searchTerm = searchBar.value.toLowerCase();
    renderOrders(searchTerm);
  });

  document.querySelector(".js-search-bar").addEventListener("input", () => {
    const searchTerm = document
      .querySelector(".js-search-bar")
      .value.toLowerCase();
    renderOrders(searchTerm);
  });
}

function updateCartQuantity() {
  let cartQuantity = 0;
  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  document.querySelector(".js-cart-quantity").innerHTML = cartQuantity;
}

function renderOrders(searchTerm = "") {
  let ordersHTML = "";

  const filteredOrders = orders.filter((order) => {
    if (!searchTerm) return true;
    let hasMatchingProduct = false;
    order.products.forEach((productDetails) => {
      const product = getProduct(productDetails.productId);
      if (product.name.toLowerCase().includes(searchTerm)) {
        hasMatchingProduct = true;
      }
    });
    return hasMatchingProduct;
  });

  if (filteredOrders.length === 0) {
    document.querySelector(".js-orders-grid").innerHTML = `
      You have no orders. <a href="amazon.html">View products</a>
    `;
    return;
  }

  filteredOrders.forEach((order) => {
    const orderTimeString = dayjs(order.orderTime).format("MMMM D");

    ordersHTML += `
      <div class="order-container">
        <div class="order-header">
          <div class="order-header-left-section">
            <div class="order-date">
              <div class="order-header-label">Order Placed:</div>
              <div>${orderTimeString}</div>
            </div>
            <div class="order-total">
              <div class="order-header-label">Total:</div>
              <div>$${formatCurrency(order.totalCostCents)}</div>
            </div>
          </div>
          <div class="order-header-right-section">
            <div class="order-header-label">Order ID:</div>
            <div>${order.id}</div>
          </div>
        </div>
        <div class="order-details-grid">
    `;

    order.products.forEach((productDetails) => {
      const product = getProduct(productDetails.productId);
      const deliveryTimeString = dayjs(
        productDetails.estimatedDeliveryTime,
      ).format("MMMM D");

      ordersHTML += `
        <div class="product-image-container">
          <img src="${product.image}">
        </div>
        <div class="product-details">
          <div class="product-name">
            ${product.name}
          </div>
          <div class="product-delivery-date">
            Arriving on: ${deliveryTimeString}
          </div>
          <div class="product-quantity">
            Quantity: ${productDetails.quantity}
          </div>
          <button class="buy-again-button button-primary js-buy-again" data-product-id="${product.id}">
            <img class="buy-again-icon" src="images/icons/buy-again.png">
            <span class="buy-again-message">Buy it again</span>
          </button>
        </div>
        <div class="product-actions">
          <a href="tracking.html?orderId=${order.id}&productId=${product.id}">
            <button class="track-package-button button-secondary">
              Track package
            </button>
          </a>
        </div>
      `;
    });

    ordersHTML += `
        </div>
      </div>
    `;
  });

  document.querySelector(".js-orders-grid").innerHTML = ordersHTML;

  document.querySelectorAll(".js-buy-again").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.productId;
      addToCart(productId);
      updateCartQuantity();
    });
  });
}

initPage();
