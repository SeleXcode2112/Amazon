import { orders } from '../data/orders.js';
import { getProduct, loadProductsFetch } from '../data/products.js';
import { cart } from '../data/cart.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

async function initPage() {
  await loadProductsFetch();
  
  const url = new URL(window.location.href);
  const orderId = url.searchParams.get('orderId');
  const productId = url.searchParams.get('productId');
  
  let matchingOrder;
  orders.forEach((order) => {
    if (order.id === orderId) {
      matchingOrder = order;
    }
  });

  let matchingProductDetails;
  if (matchingOrder) {
    matchingOrder.products.forEach((details) => {
      if (details.productId === productId) {
        matchingProductDetails = details;
      }
    });
  }

  if (!matchingOrder || !matchingProductDetails) {
    document.querySelector('.js-tracking-content').innerHTML = 'Order or product not found.';
    updateCartQuantity();
    return;
  }

  const product = getProduct(productId);
  
  const orderTime = dayjs(matchingOrder.orderTime);
  const deliveryTime = dayjs(matchingProductDetails.estimatedDeliveryTime);
  const today = dayjs();
  
  const percentProgress = ((today - orderTime) / (deliveryTime - orderTime)) * 100;
  const progress = Math.max(0, Math.min(100, percentProgress));
  
  let status = 'Preparing';
  if (progress >= 100 || today >= deliveryTime) {
    status = 'Delivered';
  } else if (progress >= 50) {
    status = 'Shipped';
  }
  
  const deliveryString = deliveryTime.format('dddd, MMMM D');
  
  const html = `
    <div class="delivery-date">
      Arriving on ${deliveryString}
    </div>

    <div class="product-info">
      ${product.name}
    </div>

    <div class="product-info">
      Quantity: ${matchingProductDetails.quantity}
    </div>

    <img class="product-image" src="${product.image}">

    <div class="progress-labels-container">
      <div class="progress-label ${status === 'Preparing' ? 'current-status' : ''}">
        Preparing
      </div>
      <div class="progress-label ${status === 'Shipped' ? 'current-status' : ''}">
        Shipped
      </div>
      <div class="progress-label ${status === 'Delivered' ? 'current-status' : ''}">
        Delivered
      </div>
    </div>

    <div class="progress-bar-container">
      <div class="progress-bar" style="width: ${progress}%"></div>
    </div>
  `;
  
  document.querySelector('.js-tracking-content').innerHTML = html;
  
  updateCartQuantity();
}

function updateCartQuantity() {
  let cartQuantity = 0;
  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
}

initPage();
