import { cart, addToCart } from "../data/cart.js";
import { products, loadProducts } from "../data/products.js";
import { formatCurrency } from "./utils/money.js";
loadProducts(renderProductsGrid);

let addedTimeouts = {};

function renderProductsGrid(filteredProducts) {
  const productsToRender = filteredProducts || products;
  let productsHTML = "";
  productsToRender.forEach((product) => {
    productsHTML += `
    <div class="product-container">
          <div class="product-image-container">
            <img class="product-image"
              src="${product.image}">
          </div>

          <div class="product-name limit-text-to-2-lines">
            ${product.name}
          </div>

          <div class="product-rating-container">
            <img class="product-rating-stars"
              src="${product.getStartsUrl()}">
            <div class="product-rating-count link-primary">
              ${product.rating.count}
            </div>
          </div>

          <div class="product-price">
            ${product.getPrice()}
          </div>

          <div class="product-quantity-container">
            <select class="js-quantity-selector-${product.id}">
              <option selected value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
              <option value="7">7</option>
              <option value="8">8</option>
              <option value="9">9</option>
              <option value="10">10</option>
            </select>
          </div>

          ${product.extraInfoHTML()}

          <div class="product-spacer"></div>

          <div class="added-to-cart js-added-to-cart-${product.id}">
            <img src="images/icons/checkmark.png">
            Added
          </div>

          <button class="add-to-cart-button button-primary js-add-to-cart" data-product-id="${product.id}">
            Add to Cart
          </button>
        </div>
    `;
  });

  document.querySelector(".js-products-grid").innerHTML = productsHTML;

  function updateCartQuantity() {
    let cartQuantity = 0;
    cart.forEach((cartItem) => {
      cartQuantity += cartItem.quantity;
    });
    document.querySelector(".js-cart-quantity").textContent = cartQuantity;
  }

  document.querySelectorAll(".js-add-to-cart").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.dataset.productId;

      // Read quantity from the select dropdown
      const quantitySelect = document.querySelector(
        `.js-quantity-selector-${productId}`,
      );
      const quantity = Number(quantitySelect.value);

      addToCart(productId, quantity);
      updateCartQuantity();

      // Show "Added" checkmark animation
      showAddedMessage(productId);
    });
  });

  // Initial cart quantity update
  updateCartQuantity();
}

function showAddedMessage(productId) {
  const addedElement = document.querySelector(
    `.js-added-to-cart-${productId}`,
  );
  addedElement.classList.add("added-to-cart-visible");

  // Clear any existing timeout for this product
  if (addedTimeouts[productId]) {
    clearTimeout(addedTimeouts[productId]);
  }

  addedTimeouts[productId] = setTimeout(() => {
    addedElement.classList.remove("added-to-cart-visible");
    delete addedTimeouts[productId];
  }, 2000);
}

// Search functionality
document.querySelector(".search-button").addEventListener("click", () => {
  performSearch();
});

document.querySelector(".search-bar").addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    performSearch();
  }
});

function performSearch() {
  const searchTerm = document.querySelector(".search-bar").value.toLowerCase().trim();

  if (!searchTerm) {
    renderProductsGrid();
    return;
  }

  const filtered = products.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(searchTerm);
    const keywordMatch =
      product.keywords &&
      product.keywords.some((kw) => kw.toLowerCase().includes(searchTerm));
    return nameMatch || keywordMatch;
  });

  renderProductsGrid(filtered);
}
