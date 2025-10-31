/* script.js */
const PRODUCTS_URL = 'products.json';
let products = [];
const el = s => document.querySelector(s);
const elAll = s => document.querySelectorAll(s);
const productGrid = el('#productGrid');
const cartBtn = el('#cartBtn');
const cartSidebar = el('#cartSidebar');
const closeCart = el('#closeCart');
const cartItemsEl = el('#cartItems');
const cartCountEl = el('#cartCount');
const cartTotalEl = el('#cartTotal');
const checkoutBtn = el('#checkoutBtn');
const checkoutModal = el('#checkoutModal');
const closeCheckout = el('#closeCheckout');
const yearSpan = el('#year');
let CART = JSON.parse(localStorage.getItem('hn_cart') || '[]');
yearSpan.textContent = new Date().getFullYear();
function formatVND(n){ return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "₫"; }

async function loadProducts(){
  try{
    const resp = await fetch(PRODUCTS_URL);
    products = await resp.json();
  }catch(e){
    console.info('Không thể tải products.json, sử dụng mặc định');
    products = [
      {"id":"guitar-001","name":"Guitar Acoustic MORIS W80","price":4500000,"img":"https://placehold.co/600x400?text=Guitar+Moris+W80","stock":5,"category":"Guitar","desc":"Guitar cao cấp, phù hợp học & biểu diễn."},
      {"id":"keyboard-001","name":"Organ Korg Pa600","price":22000000,"img":"https://placehold.co/600x400?text=Korg+Pa600","stock":2,"category":"Piano","desc":"Organ Korg Pa600 — kiểm tra nguồn & bảo hành."},
      {"id":"piano-001","name":"Piano Điện Yamaha CLP330","price":35000000,"img":"https://placehold.co/600x400?text=Yamaha+CLP330","stock":1,"category":"Piano","desc":"Piano Yamaha CLP series, cảm ứng phím tốt."}
    ];
  }
  renderProducts('all');
  updateCartUI();
}

function renderProducts(filter){
  productGrid.innerHTML = '';
  const list = filter === 'all' ? products : products.filter(p=>p.category===filter || (filter==='Classes' && p.category==='Classes'));
  list.forEach(p=>{
    const card = document.createElement('div'); card.className='card';
    card.innerHTML = `<img src="${p.img}" alt="${p.name}"><div class="card-body"><h3 class="card-title">${p.name}</h3><p class="small">${p.desc||''}</p><div class="card-price">${formatVND(p.price)}</div><div class="card-actions"><button class="btn add-cart" data-id="${p.id}">Thêm vào giỏ</button><button class="btn" onclick="viewProduct('${p.id}')">Xem</button></div></div>`;
    productGrid.appendChild(card);
  });
  elAll('.add-cart').forEach(btn=>btn.addEventListener('click', ()=>addToCart(btn.dataset.id)));
}

function viewProduct(id){
  const p = products.find(x=>x.id===id);
  if(!p) return alert('Sản phẩm không tồn tại');
  alert(`${p.name}\nGiá: ${formatVND(p.price)}\nTrạng thái: ${p.stock>0 ? 'Còn hàng' : 'Hết hàng'}\n\n${p.desc}`);
}

function addToCart(id, qty=1){
  const p = products.find(x=>x.id===id);
  if(!p) return;
  const existing = CART.find(i=>i.id===id);
  if(existing) existing.qty += qty; else CART.push({id:p.id,name:p.name,price:p.price,img:p.img,qty});
  saveCart(); openCart(); updateCartUI();
}

function saveCart(){ localStorage.setItem('hn_cart', JSON.stringify(CART)); }
function updateCartUI(){
  cartItemsEl.innerHTML=''; let total=0;
  CART.forEach(item=>{
    total += item.price * item.qty;
    const node = document.createElement('div'); node.className='cart-item';
    node.innerHTML = `<img src="${item.img}" alt="${item.name}"><div style="flex:1"><div style="font-weight:600">${item.name}</div><div class="small">${formatVND(item.price)} × <input type="number" min="1" value="${item.qty}" data-id="${item.id}" style="width:64px"></div></div><div style="text-align:right"><div style="font-weight:700">${formatVND(item.price*item.qty)}</div><button class="btn remove-item" data-id="${item.id}" style="margin-top:8px">Xóa</button></div>`;
    cartItemsEl.appendChild(node);
  });
  cartCountEl.textContent = CART.reduce((s,i)=>s+i.qty,0);
  cartTotalEl.textContent = formatVND(total);
  elAll('.remove-item').forEach(b=>b.addEventListener('click', ()=>{ CART = CART.filter(x=>x.id!==b.dataset.id); saveCart(); updateCartUI(); }));
  elAll('.cart-items input[type="number"]').forEach(inp=>inp.addEventListener('change', ()=>{ const id=inp.dataset.id; const v=parseInt(inp.value)||1; const it=CART.find(x=>x.id===id); if(it){ it.qty=v; saveCart(); updateCartUI(); }}));
}

function openCart(){ cartSidebar.classList.add('open'); cartSidebar.setAttribute('aria-hidden','false'); }
function closeCartFn(){ cartSidebar.classList.remove('open'); cartSidebar.setAttribute('aria-hidden','true'); }

cartBtn.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartFn);
checkoutBtn.addEventListener('click', ()=>{ if(CART.length===0) return alert('Giỏ hàng trống.'); checkoutModal.classList.add('open'); checkoutModal.setAttribute('aria-hidden','false'); });
closeCheckout.addEventListener('click', ()=>{ checkoutModal.classList.remove('open'); checkoutModal.setAttribute('aria-hidden','true'); });

el('#contactForm').addEventListener('submit', (e)=>{ e.preventDefault(); const fd=new FormData(e.target); const to='info@huongnhac.example'; const subject=encodeURIComponent('Liên hệ từ website: '+fd.get('name')); const body=encodeURIComponent(`Tên: ${fd.get('name')}\nEmail: ${fd.get('email')}\n\n${fd.get('message')}`); window.location.href = `mailto:${to}?subject=${subject}&body=${body}`; });

el('#checkoutForm').addEventListener('submit', (e)=>{ e.preventDefault(); const fd=new FormData(e.target); const order={id:'ORD'+Date.now(), customer:{name:fd.get('fullname'),address:fd.get('address'),phone:fd.get('phone')}, items:CART, total:CART.reduce((s,i)=>s+i.price*i.qty,0)}; alert('Đơn hàng đã được tạo (demo):\nMã: '+order.id+'\nTổng: '+formatVND(order.total)+'\nChúng tôi sẽ liên hệ sớm.'); CART=[]; saveCart(); updateCartUI(); checkoutModal.classList.remove('open'); checkoutModal.setAttribute('aria-hidden','true'); closeCartFn(); });

document.querySelectorAll('.cat-btn').forEach(b=>b.addEventListener('click', ()=>{ renderProducts(b.dataset.cat); }));

loadProducts();
