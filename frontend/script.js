const themeToggle = document.getElementById("themeToggle");
const currentTheme = localStorage.getItem("theme") || "light";

if (currentTheme === "dark") {
  document.documentElement.setAttribute("data-theme", "dark");
  themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const newTheme = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  localStorage.setItem("theme", newTheme);
  themeToggle.innerHTML = newTheme === "dark" ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
});

// Cart functionality
let cart = [];
const cartCount = document.querySelector(".cart-count");
const orderDetails = document.getElementById("orderDetails");
const orderTotal = document.getElementById("orderTotal");
const checkoutForm = document.getElementById("checkoutForm");
const formLoading = document.getElementById("formLoading");
const submitOrder = document.getElementById("submitOrder");

function addToCart(id, name, price, image) {
  const existing = cart.find((item) => item.id === id);
  if (existing) existing.quantity++;
  else cart.push({ id, name, price: parseInt(price), image, quantity: 1 });
  updateCart();
}

function updateCart() {
  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  cartCount.textContent = cart.reduce((t, i) => t + i.quantity, 0);
  orderDetails.value = cart.map((i) => `${i.name} (x${i.quantity})`).join(", ");
  orderTotal.value = `₨${total}`;
}

document.querySelectorAll(".add-to-cart").forEach((btn) => {
  btn.addEventListener("click", () => {
    addToCart(btn.dataset.id, btn.dataset.name, btn.dataset.price, btn.dataset.image);
    alert(`${btn.dataset.name} added to cart`);
  });
});

checkoutForm.addEventListener("submit", async (e) => {
  formLoading.style.display = "block";
  submitOrder.style.display = "none";
  await new Promise((r) => setTimeout(r, 1500)); // mock delay
  formLoading.style.display = "none";
  submitOrder.style.display = "block";
  alert("Order placed! You’ll receive an email confirmation soon.");
});
