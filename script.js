        // --- نظام التنبيهات (Toasts) الاحترافي ---
        function showToast(msg, type = 'error') {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            const bgColor = type === 'error' ? 'bg-red-500' : 'bg-green-500';
            const icon = type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check';

            toast.className = `flex items-center gap-2 text-white px-4 py-3 rounded-xl shadow-lg transition-all duration-300 transform -translate-y-10 opacity-0 ${bgColor}`;
            toast.innerHTML = `<i class="fa-solid ${icon}"></i><span class="text-xs font-bold">${msg}</span>`;

            container.appendChild(toast);

            // ظهور
            setTimeout(() => {
                toast.classList.remove('-translate-y-10', 'opacity-0');
                toast.classList.add('translate-y-0', 'opacity-100');
            }, 10);

            // اختفاء
            setTimeout(() => {
                toast.classList.remove('translate-y-0', 'opacity-100');
                toast.classList.add('-translate-y-10', 'opacity-0');
                setTimeout(() => toast.remove(), 300);
            }, 3500);
        }

        // المنتجات المزامنة
        const menuProducts = [
            { id: 1, name: 'مندي لحم بلدي', price: 70, cat: 'arabic', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80', cal: 890 },
            { id: 2, name: 'باستا إيطالية', price: 45, cat: 'italian', image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=400&q=80', cal: 540 },
            { id: 3, name: 'بيتزا سُكون', price: 50, cat: 'italian', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=400&q=80', cal: 710 },
            { id: 4, name: 'مشويات مشكلة', price: 58, cat: 'arabic', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80', cal: 620 },
            { id: 5, name: 'كوكتيل الخطم', price: 18, cat: 'drinks', image: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?auto=format&fit=crop&w=400&q=80', cal: 210 },
            { id: 6, name: 'حلى القهوة', price: 25, cat: 'drinks', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80', cal: 400 }
        ];

        let cart = [];
        let currentUser = null;
        let currentActiveOrder = null;
        let currentPaymentMethod = 'mada';
        let slaSecondsInterval = null;
        let activeCategory = 'all';
        let autoProgressTimeout = null;

        window.addEventListener('DOMContentLoaded', () => {
            renderMenu();
            setTimeout(() => {
                const dot = document.getElementById('wsStatusDot');
                if (dot) {
                    dot.classList.remove('disconnected');
                    dot.classList.add('connected');
                    document.getElementById('wsStatusText').innerText = "Reverb متصل";
                }
            }, 1000);

            document.getElementById('orderType').addEventListener('change', (e) => {
                const div = document.getElementById('tableSelectorDiv');
                if (e.target.value === 'safari') div.classList.add('hidden');
                else div.classList.remove('hidden');
            });
        });

        function toggleModal(id) {
            document.getElementById(id).classList.toggle('hidden');
        }

        function toggleCartSidebar() {
            document.getElementById('cartSidebar').classList.toggle('-translate-x-full');
        }

        // رندر وتصفية المنيو مع البحث والبطاقات الاحترافية
        function renderMenu() {
            const grid = document.getElementById('menuGrid');
            grid.innerHTML = '';

            const searchVal = (document.getElementById('menuSearch')?.value || '').trim().toLowerCase();

            const filtered = menuProducts.filter(p => {
                const matchesCategory = activeCategory === 'all' || p.cat === activeCategory;
                const matchesSearch = p.name.toLowerCase().includes(searchVal);
                return matchesCategory && matchesSearch;
            });

            if (filtered.length === 0) {
                grid.innerHTML = `
                    <div class="col-span-full py-16 text-center text-gray-400 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                        <i class="fa-solid fa-magnifying-glass text-4xl mb-3 text-gray-300"></i>
                        <p class="text-xs font-bold text-gray-500">لم نجد أي أطباق تطابق بحثك</p>
                        <p class="text-[10px] text-gray-400 mt-1">تأكد من كتابة الاسم بشكل صحيح أو جرب تصنيفًا آخر</p>
                    </div>
                `;
                return;
            }

            filtered.forEach(p => {
                const catName = p.cat === 'arabic' ? 'عربي' : p.cat === 'italian' ? 'إيطالي' : 'مشروبات';
                grid.innerHTML += `
                    <div class="group bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between">
                        <!-- صورة المنتج مع تأثير الحوم وبادج التصنيف -->
                        <div class="relative overflow-hidden aspect-[4/3] w-full bg-gray-100">
                            <img src="${p.image}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cached-img">
                            <div class="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60"></div>
                            
                            <!-- بادج القسم -->
                            <span class="absolute top-3 right-3 bg-white/95 backdrop-blur-md text-sokon text-[10px] font-black px-2.5 py-1 rounded-xl shadow-sm border border-sokon/5">
                                ${catName}
                            </span>
                            
                            <!-- التقييم السريع والوقت المتوقع -->
                            <div class="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-2 py-0.5 rounded-lg text-[9px] font-bold">
                                <i class="fa-solid fa-star text-amber-400"></i>
                                <span>4.8</span>
                            </div>
                        </div>

                        <!-- تفاصيل المنتج -->
                        <div class="p-4 flex-grow flex flex-col justify-between">
                            <div>
                                <h4 class="font-bold text-sm text-gray-900 group-hover:text-sokon transition-colors line-clamp-1 mb-1">${p.name}</h4>
                                <div class="flex items-center gap-2 text-[10px] text-gray-400">
                                    <span class="flex items-center gap-1"><i class="fa-solid fa-fire text-amber-600"></i> ${p.cal} سعرة</span>
                                    <span class="text-gray-300">|</span>
                                    <span class="flex items-center gap-1"><i class="fa-solid fa-clock"></i> 15 د</span>
                                </div>
                            </div>

                            <!-- السعر وزر الإضافة -->
                            <div class="mt-4 flex justify-between items-center border-t pt-3 border-gray-50">
                                <div class="flex flex-col">
                                    <span class="text-[9px] text-gray-400 font-semibold">السعر</span>
                                    <span class="font-black text-sokon text-base">${p.price} <span class="text-[10px] font-bold text-gray-500">ريال</span></span>
                                </div>
                                <button onclick="addToCart(${p.id})" class="bg-sokon hover:bg-sokon-dark text-white hover:scale-105 active:scale-95 shadow-md shadow-sokon/10 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 flex items-center gap-1.5">
                                    <i class="fa-solid fa-plus text-[10px]"></i>
                                    <span>أضف</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        function filterCategory(cat, btn) {
            activeCategory = cat;
            document.querySelectorAll('.cat-btn').forEach(b => {
                b.className = "cat-btn px-4 py-2 rounded-xl text-xs font-bold bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 transition whitespace-nowrap";
            });
            if (btn) {
                btn.className = "cat-btn px-4 py-2 rounded-xl text-xs font-bold bg-sokon text-white shadow-md shadow-sokon/10 transition whitespace-nowrap";
            } else {
                const buttons = document.querySelectorAll('.cat-btn');
                buttons.forEach(b => {
                    if (b.getAttribute('onclick') && b.getAttribute('onclick').includes(`'${cat}'`)) {
                        b.className = "cat-btn px-4 py-2 rounded-xl text-xs font-bold bg-sokon text-white shadow-md shadow-sokon/10 transition whitespace-nowrap";
                    }
                });
            }
            renderMenu();
        }

        // السلة
        function addToCart(id) {
            const prod = menuProducts.find(p => p.id === id);
            const exist = cart.find(i => i.product.id === id);
            if (exist) exist.quantity++;
            else cart.push({ product: prod, quantity: 1 });
            updateCartUI();
            showToast('تمت إضافة الطبق للسلة بنجاح', 'success');
        }

        function updateCartUI() {
            const list = document.getElementById('cartItemsList');
            const totalQty = cart.reduce((acc, c) => acc + c.quantity, 0);
            const totalPrice = cart.reduce((acc, c) => acc + (c.product.price * c.quantity), 0);

            document.getElementById('cartCount').innerText = totalQty;
            if (document.getElementById('mobileCartCount')) {
                document.getElementById('mobileCartCount').innerText = totalQty;
            }
            document.getElementById('cartTotalPrice').innerText = totalPrice;

            if (cart.length === 0) {
                list.innerHTML = `<p class="text-gray-400 text-center py-8 text-xs">السلة فارغة.</p>`;
                return;
            }

            list.innerHTML = '';
            cart.forEach(item => {
                list.innerHTML += `
                    <div class="flex justify-between items-center border-b pb-2 text-xs gap-2">
                        <div class="flex-grow">
                            <h5 class="font-bold text-gray-800">${item.product.name}</h5>
                            <span class="text-[10px] text-gray-400">${item.product.price} ريال × ${item.quantity}</span>
                        </div>
                        <div class="flex items-center gap-1">
                            <button onclick="changeQty(${item.product.id}, -1)" class="w-6 h-6 bg-gray-100 rounded-lg text-center font-bold hover:bg-gray-200">-</button>
                            <span class="font-bold px-1.5 w-4 text-center">${item.quantity}</span>
                            <button onclick="changeQty(${item.product.id}, 1)" class="w-6 h-6 bg-gray-100 rounded-lg text-center font-bold hover:bg-gray-200">+</button>
                        </div>
                    </div>
                `;
            });
        }

        function changeQty(id, delta) {
            const item = cart.find(i => i.product.id === id);
            if (!item) return;
            item.quantity += delta;
            if (item.quantity <= 0) cart = cart.filter(i => i.product.id !== id);
            updateCartUI();
        }

        // الـ OTP وإنشاء الحساب
        let currentAuthTab = 'login';

        function switchAuthTab(tab) {
            currentAuthTab = tab;
            const tabLogin = document.getElementById('tabLogin');
            const tabRegister = document.getElementById('tabRegister');
            const nameDiv = document.getElementById('nameInputDiv');
            const submitText = document.getElementById('authSubmitText');
            
            if (tab === 'login') {
                tabLogin.className = "w-1/2 pb-2.5 font-bold text-sokon border-b-2 border-sokon text-center transition-all";
                tabRegister.className = "w-1/2 pb-2.5 font-bold text-gray-400 text-center transition-all";
                nameDiv.classList.add('hidden');
                submitText.innerText = "إرسال رمز التفعيل";
            } else {
                tabLogin.className = "w-1/2 pb-2.5 font-bold text-gray-400 text-center transition-all";
                tabRegister.className = "w-1/2 pb-2.5 font-bold text-sokon border-b-2 border-sokon text-center transition-all";
                nameDiv.classList.remove('hidden');
                submitText.innerText = "إنشاء حساب وتفعيل 🚀";
            }
        }

        function sendOTP() {
            if (currentAuthTab === 'register') {
                const name = document.getElementById('registerName').value.trim();
                if (name.length < 3) {
                    showToast("يرجى إدخال اسمك الكامل بشكل صحيح", "error");
                    return;
                }
            }

            const phone = document.getElementById('userPhone').value;
            if (phone.length < 9) {
                showToast("أدخل رقم جوال صحيح مكون من 9 أرقام", "error");
                return;
            }
            document.getElementById('otpStep1').classList.add('hidden');
            document.getElementById('otpStep2').classList.remove('hidden');
            showToast('تم إرسال كود التفعيل بنجاح', 'success');
        }

        function verifyOTP() {
            const code = document.getElementById('otpCode').value;
            if (code.length !== 6) {
                showToast("أدخل كود التفعيل المكون من 6 أرقام", "error");
                return;
            }
            
            let displayName = "عميل سُكون";
            if (currentAuthTab === 'register') {
                displayName = document.getElementById('registerName').value.trim();
            } else {
                displayName = `ضيف سُكون (0${document.getElementById('userPhone').value.substring(0,2)}***)`;
            }

            currentUser = { name: displayName, phone: document.getElementById('userPhone').value, tier: 'فضي', points: 50 };
            toggleModal('authModal');

            // تحديث واجهة المستخدم
            document.getElementById('userProfileArea').innerHTML = `
                <span class="text-xs font-bold bg-green-50 text-green-700 px-3 py-1.5 rounded-xl border border-green-200 flex items-center gap-1">
                    <i class="fa-solid fa-circle-check"></i> مرحباً، ${currentUser.name}
                </span>`;

            document.getElementById('cardOwnerName').innerText = currentUser.name;
            document.getElementById('cardTierBadge').innerText = currentUser.tier;
            document.getElementById('cardPoints').innerText = currentUser.points;
            document.getElementById('cardProgress').style.width = "20%";
            document.getElementById('cardNextTierText').innerText = "تبقت 5 طلبات للذهبي";

            showToast(`مرحباً بك ${currentUser.name}، تم تفعيل الحساب وكارت الولاء`, 'success');
        }

        function quickGuestLogin() {
            currentUser = { name: 'فهد الفيفي', phone: '599999999', tier: 'ذهبي', points: 250 };
            toggleModal('authModal');

            // تحديث واجهة المستخدم
            document.getElementById('userProfileArea').innerHTML = `
                <span class="text-xs font-bold bg-sokon/10 text-sokon px-3 py-1.5 rounded-xl border border-sokon/20 flex items-center gap-1">
                    <i class="fa-solid fa-circle-check"></i> مرحباً، ${currentUser.name}
                </span>`;

            document.getElementById('cardOwnerName').innerText = currentUser.name;
            document.getElementById('cardTierBadge').innerText = currentUser.tier;
            document.getElementById('cardPoints').innerText = currentUser.points;
            document.getElementById('cardProgress').style.width = "60%";
            document.getElementById('cardNextTierText').innerText = "تبقت طلبين للبلاتيني";

            showToast('تم تسجيل الدخول التجريبي بنجاح', 'success');
        }

        function resetOTPForm() {
            document.getElementById('otpStep2').classList.add('hidden');
            document.getElementById('otpStep1').classList.remove('hidden');
        }

        // الحجوزات
        let selectedTableNum = null;
        function openBookingModal() {
            const grid = document.getElementById('tablesGrid');
            grid.innerHTML = '';
            for (let i = 1; i <= 6; i++) {
                grid.innerHTML += `
                    <div onclick="selectTable(${i})" id="book_table_${i}" class="p-2 border text-center rounded-xl bg-gray-50 text-gray-700 border-gray-200 text-xs font-bold cursor-pointer hover:border-sokon transition">
                        طاولة ${i}
                    </div>
                `;
            }
            selectedTableNum = null;
            toggleModal('bookingModal');
        }

        function selectTable(num) {
            for (let i = 1; i <= 6; i++) {
                const el = document.getElementById(`book_table_${i}`);
                if (el) el.className = "p-2 border text-center rounded-xl bg-gray-50 text-gray-700 border-gray-200 text-xs font-bold cursor-pointer hover:border-sokon transition";
            }
            document.getElementById(`book_table_${num}`).className = "p-2 border text-center rounded-xl bg-sokon text-white border-sokon text-xs font-bold shadow-md cursor-pointer transition";
            selectedTableNum = num;
        }

        function confirmBooking() {
            if (!document.getElementById('bookingDate').value) {
                showToast("يرجى تحديد التاريخ", "error");
                return;
            }
            if (!selectedTableNum) {
                showToast("يرجى اختيار الطاولة المتاحة أولاً", "error");
                return;
            }
            if (!currentUser) {
                toggleModal('bookingModal');
                showToast("يجب تسجيل الدخول لإتمام الحجز", "error");
                toggleModal('authModal');
                return;
            }
            toggleModal('bookingModal');
            showToast(`تم الحجز بنجاح (طاولة ${selectedTableNum}) وتم خصم العربون.`, 'success');
        }

        // ميسر
        function openMoyasarPaymentWindow() {
            if (cart.length === 0) {
                showToast("السلة فارغة، أضف أطباقاً أولاً", "error");
                return;
            }
            if (!currentUser) {
                showToast("يرجى تسجيل الدخول أولاً لإتمام الدفع", "error");
                toggleCartSidebar();
                toggleModal('authModal');
                return;
            }
            document.getElementById('moyasarPayAmount').innerText = document.getElementById('cartTotalPrice').innerText;
            
            // تفريغ حقول الدفع ليدخلها الزائر بنفسه كعملية دفع حقيقية
            const nameEl = document.getElementById('cardName');
            const numEl = document.getElementById('cardNumber');
            const expEl = document.getElementById('cardExpiry');
            const cvvEl = document.getElementById('cardCvv');
            if (nameEl) nameEl.value = "";
            if (numEl) numEl.value = "";
            if (expEl) expEl.value = "";
            if (cvvEl) cvvEl.value = "";

            toggleCartSidebar();
            toggleModal('moyasarModal');
            selectPaymentMethod('mada');
        }

        function selectPaymentMethod(method) {
            currentPaymentMethod = method;
            document.querySelectorAll('.pay-method-btn').forEach(b => {
                b.className = "pay-method-btn border border-gray-200 rounded-xl p-2 flex flex-col items-center justify-center transition hover:bg-gray-50";
            });

            const cardForm = document.getElementById('creditCardForm');
            const appleBtn = document.getElementById('applePayBtnContainer');
            const mainPayBtn = document.getElementById('mainPayBtn');

            if (method === 'mada') {
                document.getElementById('btnMada').className = "pay-method-btn border-2 border-sokon bg-sokon/5 rounded-xl p-2 flex flex-col items-center justify-center transition";
                cardForm.classList.remove('hidden');
                appleBtn.classList.add('hidden');
                mainPayBtn.classList.remove('hidden');
                document.getElementById('cardIcon').className = "fa-solid fa-credit-card absolute left-3 top-3.5 text-amber-600";
            } else if (method === 'visa') {
                document.getElementById('btnVisa').className = "pay-method-btn border-2 border-sokon bg-sokon/5 rounded-xl p-2 flex flex-col items-center justify-center transition";
                cardForm.classList.remove('hidden');
                appleBtn.classList.add('hidden');
                mainPayBtn.classList.remove('hidden');
                document.getElementById('cardIcon').className = "fa-brands fa-cc-visa absolute left-3 top-3.5 text-blue-600";
            } else {
                document.getElementById('btnApple').className = "pay-method-btn border-2 border-sokon bg-sokon/5 rounded-xl p-2 flex flex-col items-center justify-center transition";
                cardForm.classList.add('hidden');
                appleBtn.classList.remove('hidden');
                mainPayBtn.classList.add('hidden');
            }
        }

        // الدفع وتتبع الطلب
        function processMoyasarPayment() {
            if (currentPaymentMethod !== 'apple') {
                const num = document.getElementById('cardNumber').value;
                if (!num || num.length < 12) {
                    showToast("تأكد من إدخال بيانات البطاقة بشكل صحيح", "error");
                    return;
                }
            }

            toggleModal('moyasarModal');
            showToast("تم الدفع الفوري بنجاح، يتم تحويلك للتتبع...", "success");

            const type = document.getElementById('orderType').value;
            const table = document.getElementById('orderTableNumber').value;
            const price = parseFloat(document.getElementById('moyasarPayAmount').innerText);
            const totalQty = cart.reduce((acc, c) => acc + c.quantity, 0);

            let slaMinutes = 5;
            if (totalQty > 2 && totalQty <= 5) slaMinutes = 10;
            else if (totalQty > 5) slaMinutes = 20;

            if (autoProgressTimeout) clearTimeout(autoProgressTimeout);
            currentActiveOrder = {
                id: Math.floor(100000 + Math.random() * 900000),
                type: type === 'local' ? `محلي (طاولة ${table})` : 'سفري',
                subtotal: (price / 1.15).toFixed(2),
                vat: (price - (price / 1.15)).toFixed(2),
                total: price.toFixed(2),
                items: [...cart],
                stage: 1,
                sla: slaMinutes,
                timeStr: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
            };

            // إرسال الطلب فوراً للمطبخ الذكي KDS
            kitchenOrders.unshift(currentActiveOrder);
            playKdsSound();

            cart = [];
            updateCartUI();

            const trackSec = document.getElementById('orderTrackingSection');
            const kitchSec = document.getElementById('kitchenSection');

            trackSec.classList.remove('hidden');
            kitchSec.classList.remove('hidden');

            renderZatcaBill();
            updateTrackingStateMachine();
            renderKitchenPanel();

            // تمرير الشاشة للأسفل للتتبع
            setTimeout(() => trackSec.scrollIntoView({ behavior: 'smooth' }), 300);

            // محاكاة تلقائية للمرحلة الثانية
            setTimeout(() => {
                if (currentActiveOrder && currentActiveOrder.stage === 1) advanceStageManually(currentActiveOrder.id);
            }, 3000);
        }

        function renderZatcaBill() {
            if (!currentActiveOrder) return;
            document.getElementById('trackOrderID').innerText = currentActiveOrder.id;
            document.getElementById('trackOrderTypeBadge').innerText = currentActiveOrder.type;
            document.getElementById('trackOrderTime').innerText = currentActiveOrder.timeStr;

            const cont = document.getElementById('trackBillItems');
            cont.innerHTML = '';
            currentActiveOrder.items.forEach(item => {
                cont.innerHTML += `<div class="flex justify-between"><span>${item.product.name} × ${item.quantity}</span><span>${(item.product.price * item.quantity)} ريال</span></div>`;
            });

            document.getElementById('billSubtotal').innerText = currentActiveOrder.subtotal;
            document.getElementById('billVat').innerText = currentActiveOrder.vat;
            document.getElementById('billTotal').innerText = currentActiveOrder.total;
        }

        function updateTrackingStateMachine() {
            if (!currentActiveOrder) return;
            const stage = currentActiveOrder.stage;

            const hIcon = document.getElementById('headerStatusIcon');
            if (stage === 1) hIcon.className = "fa-solid fa-wallet text-white animate-bounce";
            else if (stage === 2) hIcon.className = "fa-solid fa-fire-burner text-white animate-spin";
            else if (stage === 3) hIcon.className = "fa-solid fa-bell-concierge text-white animate-bounce";
            else if (stage === 4) hIcon.className = "fa-solid fa-circle-check text-white";

            for (let i = 1; i <= 4; i++) {
                const node = document.getElementById(`step_node_${i}`);
                const dot = document.getElementById(`step_dot_${i}`);
                const card = document.getElementById(`step_card_${i}`);
                const iconBg = document.getElementById(`step_icon_bg_${i}`);
                const badge = document.getElementById(`step_badge_${i}`);
                const desc = document.getElementById(`step_desc_${i}`);

                if (i < stage) {
                    node.classList.remove('opacity-40');
                    dot.className = "absolute -right-[41px] top-2.5 w-6 h-6 rounded-full bg-green-500 border-4 border-white ring-2 ring-green-100 flex items-center justify-center text-[9px] text-white transition-all duration-300 shadow-sm";
                    dot.innerHTML = `<i class="fa-solid fa-check"></i>`;
                    card.className = "bg-white rounded-2xl p-4 border border-green-200/60 flex justify-between items-center transition-all duration-300 shadow-sm";
                    iconBg.className = "w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-sm transition-all duration-300";
                    badge.className = "text-[10px] font-bold bg-green-50 text-green-700 px-2.5 py-1 rounded-lg";
                    badge.innerText = "مكتمل";
                } else if (i === stage) {
                    node.classList.remove('opacity-40');
                    dot.className = "absolute -right-[41px] top-2.5 w-6 h-6 rounded-full bg-sokon border-4 border-white ring-2 ring-sokon-light flex items-center justify-center text-[9px] text-white animate-pulse shadow-md";
                    dot.innerHTML = ``;
                    card.className = "bg-sokon/5 rounded-2xl p-4 border-2 border-sokon flex justify-between items-center transition-all duration-300 shadow-md";
                    iconBg.className = "w-10 h-10 rounded-xl bg-sokon text-white flex items-center justify-center text-sm animate-pulse shadow-sm";
                    badge.className = "text-[10px] font-bold bg-sokon text-white px-2.5 py-1 rounded-lg animate-pulse-slow shadow-sm";

                    if (stage === 1) { badge.innerText = "جاري التأكيد"; desc.innerText = "تأكيد عملية السحب اللحظية من بوابة الدفع."; }
                    else if (stage === 2) {
                        badge.innerText = "في المطبخ";
                        desc.innerText = "يقوم الشيف حالياً بتحضير أطباقك اللذيذة بحب.";
                        startSlaTimerCount(currentActiveOrder.sla);
                    }
                    else if (stage === 3) { badge.innerText = "جاهز للاستلام"; desc.innerText = "أطباقك ساخنة وجاهزة! توجه إلى نافذة الاستلام أو طاولة رقم " + (document.getElementById('orderTableNumber')?.value || 1); }
                    else if (stage === 4) {
                        badge.className = "text-[10px] font-bold bg-green-600 text-white px-2.5 py-1 rounded-lg shadow-sm";
                        badge.innerText = "تم التسليم";
                        desc.innerText = "بالعافية عليك! تم تسليم طلبك وإضافة نقاط الولاء بنجاح.";
                        document.getElementById('trackSLACountdown').innerText = "تم التسليم بنجاح ✔";
                        document.getElementById('trackSLACountdown').className = "text-base font-black text-green-400 block";
                        if (slaSecondsInterval) clearInterval(slaSecondsInterval);
                    }
                } else {
                    node.classList.add('opacity-40');
                    dot.className = "absolute -right-[41px] top-2.5 w-6 h-6 rounded-full bg-slate-200 border-4 border-white ring-2 ring-slate-100 flex items-center justify-center text-[9px] text-white font-bold transition-all duration-300";
                    dot.innerHTML = ``;
                    card.className = "bg-slate-50 rounded-2xl p-4 border border-slate-100 flex justify-between items-center opacity-70 transition-all duration-300";
                    iconBg.className = "w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center text-sm transition-all duration-300";
                    badge.className = "text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-lg";
                    badge.innerText = "معلق";
                }
            }
        }

        function startSlaTimerCount(mins) {
            if (slaSecondsInterval) clearInterval(slaSecondsInterval);
            let secs = mins * 60;
            const el = document.getElementById('trackSLACountdown');
            slaSecondsInterval = setInterval(() => {
                let m = Math.floor(secs / 60);
                let s = secs % 60;
                el.innerText = `متبقي: ${m}:${s < 10 ? '0' : ''}${s}`;
                secs--;
                if (secs < 0) {
                    clearInterval(slaSecondsInterval);
                    el.innerText = "تأخر الـ SLA!";
                    el.className = "text-xs font-black text-red-400 block";
                }
            }, 1000);
        }

        // نظام شاشة تحضير المطبخ اللحظي وتنبيهات الطاولات (Live KDS & Table Alerts)
        let kitchenOrders = [
            {
                id: 887412,
                type: 'محلي (طاولة 3)',
                total: '88.00',
                items: [
                    { product: { name: 'باستا إيطالية', price: 45 }, quantity: 1 },
                    { product: { name: 'حلى القهوة', price: 25 }, quantity: 1 }
                ],
                stage: 2, // preparing
                sla: 10,
                elapsed: 140,
                timeStr: '04:10 م'
            },
            {
                id: 304891,
                type: 'سفري',
                total: '50.00',
                items: [
                    { product: { name: 'بيتزا سُكون', price: 50 }, quantity: 1 }
                ],
                stage: 3, // ready
                sla: 5,
                elapsed: 220,
                timeStr: '04:12 م'
            }
        ];

        let tableAlerts = [];

        // تشغيل صوت تنبيه الكتروني نظيف بدون ملفات خارجية (Web Audio API)
        function playKdsSound() {
            try {
                const ctx = new (window.AudioContext || window.webkitAudioContext)();
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.4);
            } catch (e) {
                console.log("Audio not allowed yet by user interaction");
            }
        }

        // دورة زمنية لتحديث أزمنة التحضير (SLA)
        setInterval(() => {
            kitchenOrders.forEach(order => {
                if (order.stage === 2) {
                    order.elapsed = (order.elapsed || 0) + 1;
                }
            });
            renderKitchenPanel();
        }, 1000);

        function toggleKitchenSection() {
            const sec = document.getElementById('kitchenSection');
            if(sec) {
                const isHidden = sec.classList.toggle('hidden');
                if(!isHidden) {
                    setTimeout(() => {
                        sec.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                }
            }
        }

        function requestTableService(requestType) {
            if(!currentActiveOrder) {
                showToast("يجب أن يكون لديك طلب نشط لإرسال تنبيهات الطاولة", "error");
                return;
            }
            const tableNum = document.getElementById('orderTableNumber')?.value || 1;
            const newAlert = {
                id: Math.floor(1000 + Math.random() * 9000),
                table: tableNum,
                type: requestType,
                timeStr: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                timestamp: Date.now()
            };
            
            showToast("تم إرسال طلب الخدمة للموظفين فورياً ⚡", "success");
            
            tableAlerts.unshift(newAlert);
            renderTableAlerts();
            
            const sec = document.getElementById('kitchenSection');
            sec.classList.remove('hidden');
            setTimeout(() => {
                sec.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }

        function renderTableAlerts() {
            const container = document.getElementById('tableAlertsContainer');
            const badge = document.getElementById('alertsCountBadge');
            
            if(!container) return;
            badge.innerText = `${tableAlerts.length} تنبيه`;
            
            if(tableAlerts.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12 text-slate-400 text-[10px] font-bold">
                        <i class="fa-solid fa-circle-check text-xl mb-1.5 block text-slate-300"></i>
                        لا توجد طلبات خدمة معلقة
                    </div>
                `;
                return;
            }
            
            container.innerHTML = '';
            tableAlerts.forEach(alert => {
                let title = "";
                let iconClass = "";
                let colorClass = "";
                if(alert.type === 'cleaning_request') {
                    title = "طلب تنظيف الطاولة";
                    iconClass = "fa-broom text-amber-500";
                    colorClass = "border-amber-100 bg-amber-50/30";
                } else if(alert.type === 'safari_request') {
                    title = "طلب تعبئة سفاري";
                    iconClass = "fa-bag-shopping text-blue-500";
                    colorClass = "border-blue-100 bg-blue-50/30";
                } else if(alert.type === 'print_invoice') {
                    title = "طلب طباعة الفاتورة";
                    iconClass = "fa-file-invoice-dollar text-green-500";
                    colorClass = "border-green-100 bg-green-50/30";
                }
                
                container.innerHTML += `
                    <div class="p-3 border rounded-2xl flex justify-between items-center transition-all ${colorClass}">
                        <div class="flex items-center gap-2">
                            <div class="w-7 h-7 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-[10px] shadow-sm">
                                <i class="fa-solid ${iconClass}"></i>
                            </div>
                            <div>
                                <h4 class="font-bold text-[10px] text-gray-800">${title}</h4>
                                <div class="flex gap-1.5 text-[8px] text-gray-400 mt-0.5">
                                    <span>طاولة: ${alert.table}</span>
                                    <span>•</span>
                                    <span>${alert.timeStr}</span>
                                </div>
                            </div>
                        </div>
                        <button onclick="dismissAlert(${alert.id})" class="bg-gray-100 hover:bg-sokon hover:text-white text-gray-700 font-bold px-2 py-1 rounded-lg text-[8px] border border-gray-200 transition">
                            إنهاء
                        </button>
                    </div>
                `;
            });
        }

        function dismissAlert(id) {
            tableAlerts = tableAlerts.filter(a => a.id !== id);
            renderTableAlerts();
            showToast("تم إنهاء ومعالجة طلب الخدمة بنجاح", "success");
        }

        // محاكاة طلب جوال عشوائي جديد يصل لحظياً عبر الـ WebSocket
        function simulateIncomingOrder() {
            const randomItems = [];
            const count = Math.floor(1 + Math.random() * 3);
            for(let i=0; i<count; i++) {
                const p = menuProducts[Math.floor(Math.random() * menuProducts.length)];
                randomItems.push({ product: p, quantity: Math.floor(1 + Math.random() * 2) });
            }
            const totalQty = randomItems.reduce((acc, c) => acc + c.quantity, 0);
            const price = randomItems.reduce((acc, c) => acc + (c.product.price * c.quantity), 0);
            
            const newOrder = {
                id: Math.floor(100000 + Math.random() * 900000),
                type: Math.random() > 0.5 ? `محلي (طاولة ${Math.floor(1 + Math.random() * 6)})` : 'سفري',
                total: price.toFixed(2),
                items: randomItems,
                stage: 1,
                sla: totalQty <= 2 ? 5 : (totalQty <= 5 ? 10 : 20),
                elapsed: 0,
                timeStr: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
            };
            
            playKdsSound();
            kitchenOrders.unshift(newOrder);
            renderKitchenPanel();
            showToast(`تم استقبال طلب جديد #${newOrder.id} بقناة البث المباشر ⚡`, 'success');
        }

        function renderKitchenPanel() {
            const cont = document.getElementById('kitchenOrdersContainer');
            if(!cont) return;

            const activeBadge = document.getElementById('activeOrdersCount');
            if(activeBadge) {
                const activeCount = kitchenOrders.filter(o => o.stage < 4).length;
                activeBadge.innerText = `${activeCount} طلب نشط`;
            }
            
            if(kitchenOrders.length === 0) {
                cont.innerHTML = `
                    <div class="col-span-full py-12 text-center text-gray-400 font-bold text-xs bg-white rounded-3xl border border-dashed border-amber-200">
                        لا توجد طلبات جارية في المطبخ حالياً
                    </div>
                `;
                return;
            }

            cont.innerHTML = '';
            kitchenOrders.forEach(order => {
                if(order.stage === 4) return;

                let nextAction = "";
                let statusLabel = "";
                let statusColor = "";
                let progressPercent = 0;
                let progressColor = "bg-blue-500";
                let stageDescription = "";
                
                if(order.stage === 1) {
                    statusLabel = "بانتظار التأكيد";
                    statusColor = "bg-blue-50 text-blue-600 border-blue-100";
                    progressPercent = 25;
                    progressColor = "bg-blue-500";
                    stageDescription = "الطلب معلّق وبانتظار الموافقة لبدء الطهي";
                    nextAction = "بدء التحضير والطهي 🍳";
                } else if(order.stage === 2) {
                    statusLabel = "قيد التحضير";
                    statusColor = "bg-amber-50 text-amber-700 border-amber-100";
                    progressPercent = 65;
                    progressColor = "bg-amber-500 animate-pulse";
                    stageDescription = "يجري تحضير وجبتك الساخنة الآن بواسطة الشيف";
                    nextAction = "تجهيز الطلب للتسليم 🔔";
                } else if(order.stage === 3) {
                    statusLabel = "جاهز للاستلام";
                    statusColor = "bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse";
                    progressPercent = 100;
                    progressColor = "bg-emerald-500";
                    stageDescription = "وجبتك ساخنة وجاهزة للاستلام بالصحة والعافية!";
                    nextAction = "تأكيد التسليم للزبون ✔";
                }

                // حساب الـ SLA
                let slaHtml = "";
                if(order.stage === 2) {
                    const totalSlaSecs = order.sla * 60;
                    const remSecs = totalSlaSecs - order.elapsed;
                    if(remSecs > 0) {
                        const m = Math.floor(remSecs / 60);
                        const s = remSecs % 60;
                        const isUrgent = remSecs < 120;
                        const timerColor = isUrgent ? "text-amber-600 animate-pulse" : "text-green-600";
                        slaHtml = `<span class="text-[10px] font-bold ${timerColor}"><i class="fa-solid fa-clock ml-1"></i>متبقي: ${m}:${s<10?'0':''}${s}</span>`;
                    } else {
                        const diff = Math.abs(remSecs);
                        const m = Math.floor(diff / 60);
                        const s = diff % 60;
                        slaHtml = `<span class="text-[10px] font-bold text-red-500 animate-pulse"><i class="fa-solid fa-triangle-exclamation ml-1"></i>تأخر! -${m}:${s<10?'0':''}${s}</span>`;
                    }
                } else if(order.stage === 1) {
                    slaHtml = `<span class="text-[10px] text-slate-400 font-bold">وقت التحضير المتوقع: ${order.sla} د</span>`;
                } else if(order.stage === 3) {
                    slaHtml = `<span class="text-[10px] text-emerald-600 font-bold"><i class="fa-solid fa-bell-concierge ml-1 animate-bounce"></i>جاهز فوراً</span>`;
                }

                const itemsHtml = order.items.map(i => {
                    let foodIcon = "🍽️";
                    const name = i.product.name;
                    if (name.includes("مندي") || name.includes("مشويات")) foodIcon = "🥩";
                    else if (name.includes("باستا")) foodIcon = "🍝";
                    else if (name.includes("بيتزا")) foodIcon = "🍕";
                    else if (name.includes("كوكتيل") || name.includes("حلى") || name.includes("قهوة")) foodIcon = "🥤";

                    return `
                        <label class="flex justify-between items-center text-[11px] text-gray-600 py-2 border-b border-dashed border-slate-100 last:border-none cursor-pointer hover:bg-slate-50/50 px-1 rounded transition select-none">
                            <span class="flex items-center gap-2">
                                <input type="checkbox" class="w-3.5 h-3.5 text-sokon border-slate-200 rounded focus:ring-sokon cursor-pointer">
                                <span class="text-sm">${foodIcon}</span>
                                <span class="font-medium">${name}</span>
                            </span>
                            <span class="font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px]">× ${i.quantity}</span>
                        </label>
                    `;
                }).join('');

                cont.innerHTML += `
                    <div class="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
                        <div class="h-1 bg-[radial-gradient(circle,_transparent_30%,_#fdfaf7_30%)] bg-[length:8px_8px] bg-repeat-x -mt-0.5"></div>
                        
                        <div class="p-5 flex-grow">
                            <!-- التذكرة هيدر -->
                            <div class="flex justify-between items-center mb-2 pb-2 border-b border-slate-100">
                                <div>
                                    <span class="text-xs font-black text-gray-800 block">طلب #${order.id}</span>
                                    <span class="text-[9px] text-gray-400 block mt-0.5">${order.timeStr || 'الآن'}</span>
                                </div>
                                <span class="text-[9px] font-black px-2.5 py-1 rounded-xl border ${statusColor}">${statusLabel}</span>
                            </div>
                            
                            <!-- تفاصيل نوع الاستلام ومستهدف SLA -->
                            <div class="flex justify-between items-center text-[9px] font-black text-gray-500 mb-3 bg-amber-50/20 px-2.5 py-1.5 rounded-xl border border-amber-100/30">
                                <span>نوع الخدمة: <strong class="text-sokon">${order.type}</strong></span>
                                ${slaHtml}
                            </div>
                            
                            <!-- شريط تقدم مرئي للزبون -->
                            <div class="my-4">
                                <div class="flex justify-between items-center text-[9px] font-black text-gray-500 mb-1">
                                    <span>اكتمال التجهيز</span>
                                    <span class="text-sokon font-bold">${progressPercent}%</span>
                                </div>
                                <div class="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                    <div class="${progressColor} h-full rounded-full transition-all duration-500" style="width: ${progressPercent}%"></div>
                                </div>
                                <p class="text-[9px] text-gray-400 mt-1.5 flex items-center gap-1">
                                    <i class="fa-solid fa-circle-info text-amber-500"></i>
                                    <span>${stageDescription}</span>
                                </p>
                            </div>

                            <!-- عناصر الطلب -->
                            <div class="space-y-0.5 mt-2 border-t pt-2">${itemsHtml}</div>
                        </div>

                        <div class="p-4 bg-slate-50 border-t border-slate-100">
                            ${nextAction ? `
                                <button onclick="advanceStageManually(${order.id})" class="w-full bg-sokon hover:bg-sokon-dark text-white font-bold py-2 px-4 rounded-xl text-xs shadow-md shadow-sokon/10 transition flex items-center justify-center gap-1.5 hover:-translate-y-0.5">
                                    <span>${nextAction}</span>
                                    <i class="fa-solid fa-angle-left"></i>
                                </button>
                            ` : ``}
                        </div>
                    </div>
                `;
            });
        }

        function advanceStageManually(id) {
            const order = kitchenOrders.find(o => o.id === id);
            if(!order) return;

            if(order.stage < 4) {
                order.stage++;
                playKdsSound();
                
                if(currentActiveOrder && currentActiveOrder.id === id) {
                    currentActiveOrder.stage = order.stage;
                    updateTrackingStateMachine();
                    
                    if(order.stage === 4 && currentUser) {
                        currentUser.points += 20;
                        document.getElementById('cardPoints').innerText = currentUser.points;
                        showToast('تم إضافة 20 نقطة مكافأة لرصيدك!', 'success');
                    }
                }
                
                renderKitchenPanel();
            }
        }

        function startAutoProgressSimulation(orderId) {
            setTimeout(() => {
                const order = kitchenOrders.find(o => o.id === orderId);
                if(order && order.stage < 4) {
                    advanceStageManually(orderId);
                    startAutoProgressSimulation(orderId);
                }
            }, 8000);
        }

        function openBookingModal(type = 'table') {
            const title = document.querySelector('#bookingModal h3');
            if(type === 'hut') {
                title.innerHTML = '<i class="fa-solid fa-house-chimney-window ml-2"></i>حجز كوخ سُكون';
            } else if(type === 'dewaniya') {
                title.innerHTML = '<i class="fa-solid fa-couch ml-2"></i>حجز الديوانية الكبرى';
            } else {
                title.innerHTML = '<i class="fa-solid fa-calendar-days ml-2"></i>حجز طاولة - إطلالة الخطم';
            }
            toggleModal('bookingModal');
        }

        function subscribePackage(pkgType) {
            let pkgName = '';
            if(pkgType === 'silver') pkgName = 'الباقة الفضية (القهوة)';
            if(pkgType === 'gold') pkgName = 'الباقة الذهبية (الفطور)';
            if(pkgType === 'platinum') pkgName = 'الباقة البلاتينية (الشاملة)';
            
            showToast(`تم اختيار ${pkgName}. سيتم فتح بوابة الدفع...`, 'success');
            
            // محاكاة فتح بوابة الدفع بعد ثانية
            setTimeout(() => {
                document.getElementById('moyasarPayAmount').innerText = 
                    pkgType === 'silver' ? '199' : (pkgType === 'gold' ? '499' : '899');
                toggleModal('moyasarModal');
            }, 1000);
        }