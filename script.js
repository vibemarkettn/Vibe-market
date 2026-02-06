const cartModal = document.getElementById("cartModal");
const checkoutModal = document.getElementById("checkoutModal");
const cartItemsList = document.getElementById("cartItems");
let cart = JSON.parse(localStorage.getItem("cart")) || [];
const langBtn = document.querySelector(".lang-btn");

let products = {
  led:{id:"led",name:"LED RGB متعدد الألوان",price:25,img:"images/ledd.jpg",stock:10},
  casque:{id:"casque",name:"Casque Bluetooth CAT EAR",price:25,img:"images/casque.jpg",stock:5},
  mouse:{id:"mouse",name:"Elite RGB Wireless Mouse",price:30,img:"images/mouse.jpg",stock:7},
  projector:{id:"projector",name:"LED star projector with Bluetooth",price:25,img:"images/star.jpg",stock:7},
  mong:{id:"mong",name:"T800 Ultra Smart Watch — 49mm Aluminium",price:30,img:"images/mong.jpg",stock:7},
  mic:{id:"mic",name:"Professional Studio Kit — Smartphone & Camera",price:35.900,img:"images/mic.jpg",stock:7},
  bafle:{id:"bafle",name:"HAUT PARLEUR RGB",price:75,img:"images/bafle.jpg",stock:7},
  kit:{id:"kit",name:"AirPod A9 Pro — Wireless Earbuds with Touch Screen",price:45,img:"images/icot.jpg",stock:7},
  cass:{id:"cass",name:"🎧 BH02 BlackWave Headset",price:34,img:"images/cass.jpg",stock:7}
};


function updateCartUI(){
  const count = document.getElementById("cartCount");
  const totalEl = document.getElementById("cartTotal");
  if(!count || !totalEl || !cartItemsList) return;

  // حفظ cart ديما
  localStorage.setItem("cart", JSON.stringify(cart));

  count.textContent = cart.reduce((s,i)=>s+i.qty,0);
  cartItemsList.innerHTML = "";

  if(cart.length === 0){
    cartItemsList.innerHTML = "<li>🛒 السلة فارغة</li>";
    totalEl.textContent = "0";
    return;
  }

  cart.forEach((item,i)=>{
    const li = document.createElement("li");
    li.innerHTML = `
      ${item.name} (${item.qty})
      <span>${item.price * item.qty} DT</span>
      <div>
        <button onclick="cart[${i}].qty++; updateCartUI()">➕</button>
        <button onclick="cart[${i}].qty > 1 && (cart[${i}].qty--, updateCartUI())">➖</button>
        <button onclick="cart.splice(${i},1); updateCartUI()">❌</button>
      </div>
    `;
    cartItemsList.appendChild(li);
  });

  totalEl.textContent = cart.reduce((s,i)=>s+i.price*i.qty,0);
}


function addToCart(){
  const id=new URLSearchParams(location.search).get("id");
  if(!products[id])return;
  const found=cart.find(i=>i.id===id);
  found?found.qty++:cart.push({...products[id],qty:1});
  updateCartUI();
}

function loadProduct(){
  const id=new URLSearchParams(location.search).get("id");
  if(!products[id])return;
  const p=products[id];
  mainImage.src=p.img;
  pName.textContent=p.name;
  pPrice.textContent=p.price;
  pDesc.textContent=p.name;
  pStock.textContent=p.stock>0?"✔ متوفر":"❌ نفد";
}

function toggleCart(){
  const cartModal = document.getElementById("cartModal");

  if(!cartModal){
    console.error("cartModal not found");
    return;
  }

  cartModal.classList.toggle("active");
}
function toggleCheckout(){checkoutModal.classList.toggle("active")}

const openCheckoutBtn = document.querySelector(".cart-box .checkout-btn");

if(openCheckoutBtn){
  openCheckoutBtn.onclick = () => {
    if(cart.length === 0){
      alert("السلة فارغة");
      return;
    }
    toggleCheckout();
  };
}


/* ================= CHECKOUT VALIDATION ================= */
const checkoutForm = document.getElementById("checkoutForm");

if(checkoutForm){
  checkoutForm.addEventListener("submit", function(e){
    e.preventDefault();

    if(cart.length === 0){
      alert("السلة فارغة");
      return;
    }

    const firstName = document.getElementById("cFirstName").value.trim();
    const lastName  = document.getElementById("cLastName").value.trim();
    const phone     = document.getElementById("cPhone").value.trim();
    const email     = document.getElementById("cEmail").value.trim();
    const city      = document.getElementById("cCountry").value.trim();

    if(!firstName || !lastName || !phone || !email || !city){
      alert("يرجى تعمير جميع المعلومات");
      return;
    }

    /* ===== BUILD WHATSAPP MESSAGE ===== */
    let message = `🛒 *طلب جديد - VIBE MARKET*\n\n`;
    message += `👤 الاسم: ${firstName} ${lastName}\n`;
    message += `📞 الهاتف: ${phone}\n`;
    message += `📧 الإيميل: ${email}\n`;
    message += `📍 المدينة: ${city}\n\n`;
    message += `📦 *المنتجات:*\n`;

    let total = 0;
    cart.forEach(item=>{
      message += `- ${item.name} × ${item.qty} = ${item.price * item.qty} DT\n`;
      total += item.price * item.qty;
    });

    message += `\n💰 *المجموع: ${total} DT*\n`;
    message += `\n✅ يرجى تأكيد الطلب`;

    /* ===== YOUR WHATSAPP NUMBER ===== */
    const myNumber = "21623409356"; // بدّلها إذا لزم
    const url = `https://wa.me/${myNumber}?text=${encodeURIComponent(message)}`;

    window.open(url, "_blank");

    // اختياري: نفرغ السلة بعد الإرسال
    cart = [];
    localStorage.removeItem("cart");
    updateCartUI();
    checkoutForm.reset();
    toggleCheckout();
  });
}


function goProduct(id){location.href="product.html?id="+id}
function goHome(){location.href="index.html"}

window.onload = () => {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
  updateCartUI();
  if(location.pathname.includes("product")) loadProduct();
};

let lang="ar";
function toggleLang(){
  const links=document.querySelectorAll(".nav-link");
  if(lang==="ar"){
    lang="en";langBtn.textContent="AR";
    links[0].textContent="Home";
    links[1].textContent="Products";
    links[2].textContent="Contact";
  }else{
    lang="ar";langBtn.textContent="EN";
    links[0].textContent="الرئيسية";
    links[1].textContent="المنتجات";
    links[2].textContent="تواصل معنا";
  }
} 
let qty = 1;

function changeQty(v){
  qty += v;
  if(qty < 1) qty = 1;
  document.getElementById("qty").textContent = qty;
}

function addToCartQty(){
  const id = new URLSearchParams(location.search).get("id");
  if(!products[id]) return;

  const found = cart.find(i => i.id === id);
  if(found){
    found.qty += qty;
  }else{
    cart.push({...products[id], qty});
  }

  qty = 1;
  document.getElementById("qty").textContent = 1;
  updateCartUI();
}
function clearCart(){
  cart = [];
  localStorage.removeItem("cart");
  updateCartUI();
}
document.addEventListener("DOMContentLoaded", ()=>{

  const cartModal = document.getElementById("cartModal");
  const checkoutModal = document.getElementById("checkoutModal");
  const cartItemsList = document.getElementById("cartItems");
  const checkoutForm = document.getElementById("checkoutForm");
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let qty = 1;

  const products = {
    led:{id:"led",name:"LED RGB متعدد الألوان",price:25,img:"images/led.jpg",stock:10},
    casque:{id:"casque",name:"Casque Bluetooth CAT EAR",price:28,img:"images/casce.jpg",stock:5},
    charger:{id:"charger",name:"Haut-Parleur & Wireless Charger",price:45,img:"images/charg wyrls.jpg",stock:7}
  };

  function updateCartUI(){
    const count = document.getElementById("cartCount");
    const totalEl = document.getElementById("cartTotal");
    if(!count || !totalEl || !cartItemsList) return;

    localStorage.setItem("cart", JSON.stringify(cart));

    count.textContent = cart.reduce((s,i)=>s+i.qty,0);
    cartItemsList.innerHTML = "";
    if(cart.length===0){
      cartItemsList.innerHTML="<li>🛒 السلة فارغة</li>";
      totalEl.textContent="0";
      return;
    }

    cart.forEach((item,i)=>{
      const li=document.createElement("li");
      li.innerHTML=`
        ${item.name} (${item.qty})
        <span>${item.price*item.qty} DT</span>
        <div>
          <button onclick="cart[${i}].qty++; updateCartUI()">➕</button>
          <button onclick="cart[${i}].qty>1&&(cart[${i}].qty--,updateCartUI())">➖</button>
          <button onclick="cart.splice(${i},1); updateCartUI()">❌</button>
        </div>`;
      cartItemsList.appendChild(li);
    });

    totalEl.textContent = cart.reduce((s,i)=>s+i.price*i.qty,0);
  }

  function addToCartQty(){
    const id = new URLSearchParams(location.search).get("id");
    if(!products[id]) return;
    const found = cart.find(i=>i.id===id);
    if(found) found.qty += qty;
    else cart.push({...products[id], qty});
    qty = 1;
    document.getElementById("qty").textContent = 1;
    updateCartUI();
  }

  function changeQty(v){
    qty += v;
    if(qty<1) qty=1;
    document.getElementById("qty").textContent = qty;
  }

  function toggleCart(){cartModal.classList.toggle("active")}
  function toggleCheckout(){checkoutModal.classList.toggle("active")}
  function goHome(){location.href="index.html"}

  if(checkoutForm){
    checkoutForm.addEventListener("submit", function(e){
      e.preventDefault();
      if(cart.length===0){ alert("السلة فارغة"); return;}

      const firstName=document.getElementById("cFirstName").value.trim();
      const lastName=document.getElementById("cLastName").value.trim();
      const phone=document.getElementById("cPhone").value.trim();
      const email=document.getElementById("cEmail").value.trim();
      const city=document.getElementById("cCountry").value.trim();
      if(!firstName||!lastName||!phone||!email||!city){ alert("يرجى تعمير جميع المعلومات"); return;}

      let msg = `🛒 *طلب جديد - VIBE MARKET*\n\n`;
      msg += `👤 الاسم: ${firstName} ${lastName}\n📞 الهاتف: ${phone}\n📧 الإيميل: ${email}\n📍 المدينة: ${city}\n\n📦 المنتجات:\n`;
      let total=0;
      cart.forEach(p=>{
        msg += `- ${p.name} × ${p.qty} = ${p.price*p.qty} DT\n`;
        total += p.price*p.qty;
      });
      msg += `\n💰 المجموع: ${total} DT\n✅ يرجى تأكيد الطلب`;
      const phoneNumber="21620646120"; // ضع رقمك
      window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(msg)}`, "_blank");

      cart=[]; localStorage.removeItem("cart");
      updateCartUI(); checkoutForm.reset();
      if(checkoutModal) checkoutModal.classList.remove("active");
    });
  }

  updateCartUI();
});
/* ===== LOAD PRODUCTS FROM ADMIN ===== */
const savedProducts = JSON.parse(localStorage.getItem("products"));

if (savedProducts) {
  products = { ...products, ...savedProducts };
}

/* ===== RENDER PRODUCTS IN INDEX ===== */
const productsContainer = document.getElementById("productsContainer");


if (productsContainer) {
  productsContainer.innerHTML = "";

  Object.values(products).forEach(p => {
    const card = document.createElement("div");
    card.className = "product-card";
    card.onclick = () => goProduct(p.id);

    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p class="price">${p.price} DT</p>
    `;

    productsContainer.appendChild(card);
  });
}
const music = document.getElementById("bgMusic");
const toggleBtn = document.getElementById("musicToggle");

// إعدادات أولية
music.volume = 0.3;

// autoplay mute (browser يسمح)
music.play().catch(() => {});

// زر play / pause
toggleBtn.addEventListener("click", (e) => {
  e.stopPropagation();

  if (music.paused) {
    music.muted = false;
    music.play();
    toggleBtn.textContent = "⏸";
  } else {
    music.pause();
    toggleBtn.textContent = "▶";
  }
});
