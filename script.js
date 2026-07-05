/* ===================================================
   العقيد | AL AKID — منطق المتجر
   عدّل مصفوفة PRODUCTS بالأسفل لإضافة/تعديل منتجاتك
=================================================== */

// -------------------- بيانات المنتجات --------------------
// icon: أي إيموجي أو رمز يمثل المنتج (لحين إضافة صور حقيقية)
// لإضافة صورة حقيقية: أضف حقل image: "assets/products/اسم-الصورة.jpg"
// وسنعرضها تلقائيًا بدل الرمز.
const PRODUCTS = [
  { id: 1, name: "بدلة كلاسيكية سوداء", cat: "رجالي", price: 890, oldPrice: 1100, icon: "🖤" },
  { id: 2, name: "قميص حرير أبيض", cat: "رجالي", price: 320, oldPrice: null, icon: "👔" },
  { id: 3, name: "فستان سهرة ذهبي", cat: "نسائي", price: 1250, oldPrice: 1500, icon: "✨" },
  { id: 4, name: "عباءة مطرزة فاخرة", cat: "نسائي", price: 780, oldPrice: null, icon: "🕊️" },
  { id: 5, name: "ساعة يد فضية", cat: "إكسسوارات", price: 640, oldPrice: 750, icon: "⌚" },
  { id: 6, name: "حزام جلدي ذهبي", cat: "إكسسوارات", price: 210, oldPrice: null, icon: "🔗" },
  { id: 7, name: "معطف شتوي رجالي", cat: "رجالي", price: 950, oldPrice: null, icon: "🧥" },
  { id: 8, name: "حقيبة يد نسائية", cat: "نسائي", price: 540, oldPrice: 620, icon: "👜" },
];

// -------------------- الحالة (تُحفظ في الذاكرة أثناء الجلسة) --------------------
let currentCategory = "الكل";
let cart = []; // { id, qty }

// -------------------- عناصر DOM --------------------
const grid = document.getElementById("productsGrid");
const categoriesBar = document.getElementById("categories");
const cartToggle = document.getElementById("cartToggle");
const cartDrawer = document.getElementById("cartDrawer");
const cartClose = document.getElementById("cartClose");
const overlay = document.getElementById("overlay");
const cartItemsEl = document.getElementById("cartItems");
const cartTotalEl = document.getElementById("cartTotal");
const cartCountEl = document.getElementById("cartCount");
const toast = document.getElementById("toast");
const checkoutBtn = document.getElementById("checkoutBtn");
const newsletterForm = document.getElementById("newsletterForm");

// -------------------- عرض المنتجات --------------------
function renderProducts() {
  const list = currentCategory === "الكل"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.cat === currentCategory);

  grid.innerHTML = list.map(p => `
    <div class="product-card">
      <div class="product-img">
        ${p.image ? `<img src="${p.image}" alt="${p.name}" style="width:100%;height:100%;object-fit:cover;">` : p.icon}
      </div>
      <div class="product-info">
        <span class="product-cat">${p.cat}</span>
        <h3 class="product-name">${p.name}</h3>
        <div class="product-price">
          <span class="now">${p.price} ر.س</span>
          ${p.oldPrice ? `<span class="was">${p.oldPrice} ر.س</span>` : ""}
        </div>
        <button class="add-btn" data-id="${p.id}">أضف إلى السلة</button>
      </div>
    </div>
  `).join("");
}

// -------------------- الفلترة حسب الفئة --------------------
categoriesBar.addEventListener("click", (e) => {
  const btn = e.target.closest(".cat-btn");
  if (!btn) return;
  currentCategory = btn.dataset.cat;
  document.querySelectorAll(".cat-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  renderProducts();
});

// -------------------- إضافة إلى السلة --------------------
grid.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-btn");
  if (!btn) return;
  const id = Number(btn.dataset.id);
  addToCart(id);
  btn.textContent = "تمت الإضافة ✓";
  btn.classList.add("added");
  setTimeout(() => {
    btn.textContent = "أضف إلى السلة";
    btn.classList.remove("added");
  }, 1200);
});

function addToCart(id) {
  const existing = cart.find(item => item.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1 });
  }
  renderCart();
  showToast("تمت الإضافة إلى السلة");
}

function changeQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  renderCart();
}

// -------------------- رسم السلة --------------------
function renderCart() {
  const totalItems = cart.reduce((sum, i) => sum + i.qty, 0);
  cartCountEl.textContent = totalItems;

  if (cart.length === 0) {
    cartItemsEl.innerHTML = `<p class="cart-empty">سلتك فارغة حاليًا</p>`;
    cartTotalEl.textContent = "0 ر.س";
    return;
  }

  let total = 0;
  cartItemsEl.innerHTML = cart.map(item => {
    const p = PRODUCTS.find(pr => pr.id === item.id);
    const lineTotal = p.price * item.qty;
    total += lineTotal;
    return `
      <div class="cart-item">
        <div class="thumb">${p.image ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:cover;border-radius:3px;">` : p.icon}</div>
        <div class="info">
          <div class="name">${p.name}</div>
          <div class="price">${p.price} ر.س</div>
          <div class="qty-row">
            <button class="qty-btn" onclick="changeQty(${p.id}, -1)">−</button>
            <span>${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${p.id}, 1)">+</button>
            <button class="remove-btn" onclick="removeFromCart(${p.id})">حذف</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  cartTotalEl.textContent = `${total} ر.س`;
}

// اجعل الدوال متاحة لأزرار onclick المضمّنة
window.changeQty = changeQty;
window.removeFromCart = removeFromCart;

// -------------------- فتح/إغلاق السلة --------------------
function openCart() {
  cartDrawer.classList.add("open");
  overlay.classList.add("open");
}
function closeCart() {
  cartDrawer.classList.remove("open");
  overlay.classList.remove("open");
}
cartToggle.addEventListener("click", openCart);
cartClose.addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

// -------------------- إتمام الطلب (نموذج مبدئي) --------------------
checkoutBtn.addEventListener("click", () => {
  if (cart.length === 0) {
    showToast("السلة فارغة");
    return;
  }
  showToast("سيتم تفعيل الدفع قريبًا — تواصل معنا لإتمام الطلب");
  // هنا لاحقًا يمكن ربط بوابة دفع حقيقية (مثل PayTabs، Moyasar، Stripe...)
});

// -------------------- النشرة البريدية --------------------
newsletterForm.addEventListener("submit", (e) => {
  e.preventDefault();
  showToast("شكرًا لاشتراكك معنا!");
  newsletterForm.reset();
});

// -------------------- Toast --------------------
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

// -------------------- بداية التشغيل --------------------
renderProducts();
renderCart();
