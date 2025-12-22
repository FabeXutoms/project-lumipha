// admin.js - GÜNCELLENMİŞ JWT (TOKEN) SİSTEMİ

// Token'ı tarayıcıda bu isimle saklayacağız
const TOKEN_STORAGE_KEY = 'lumipha_admin_token';
// API adresi (Canlı sunucu)
// API adresi (Config'den al veya varsayılanı kullan)
const BASE_URL = (typeof CONFIG !== 'undefined' && CONFIG.API_BASE_URL)
    ? CONFIG.API_BASE_URL
    : 'https://www.lumipha.com';

// --- YARDIMCI VE GİRİŞ FONKSİYONLARI ---

// 1. Token'ı getiren fonksiyon
function getToken() {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
}

// 2. API İsteklerini Yöneten Ana Fonksiyon (GÜNCELLENDİ)
async function sendApiRequest(endpoint, method = 'GET', body = null) {
    const token = getToken();

    // Eğer token yoksa ve giriş yapmaya çalışmıyorsak null dön
    if (!token && !endpoint.includes('/auth/login')) return null;

    try {
        // ARTIK HEADER'A 'x-api-key' DEĞİL 'Authorization' EKLİYORUZ
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const config = { method, headers };
        if (body) config.body = JSON.stringify(body);

        // URL Düzenleme
        let url = endpoint;
        if (!/^https?:\/\//.test(endpoint)) {
            url = BASE_URL + (endpoint.startsWith('/') ? endpoint : '/' + endpoint);
        }

        const response = await fetch(url, config);

        // Eğer 401 (Yetkisiz) hatası alırsak, token süresi bitmiştir.
        if (response.status === 401) {
            console.warn("Oturum süresi doldu, çıkış yapılıyor...");
            logoutAdmin();
            return null;
        }

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `Hata: ${response.status}`);
        return data;

    } catch (error) {
        console.error("API Hatası:", error);
        throw error;
    }
}

// 3. Giriş Yapma Fonksiyonu (GÜNCELLENDİ - ARTIK ŞİFRE İLE)
async function loginAdmin(event) {
    if (event) event.preventDefault();

    // HTML'de id="apiKeyInput" yazan yer artık şifre kutusu oldu
    const inputEl = document.getElementById('apiKeyInput');

    if (!inputEl) { alert('Hata: Giriş kutusu bulunamadı!'); return; }

    const password = inputEl.value.trim(); // Artık burası şifre

    if (!password) { alert('Lütfen Şifrenizi giriniz!'); return; }

    const loginButton = document.querySelector('.adminbutton');
    if (loginButton) {
        loginButton.innerText = "Giriş Yapılıyor...";
        loginButton.disabled = true;
    }

    try {
        // YENİ SİSTEM: POST /auth/login'e şifre gönderiyoruz
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: password })
        });

        const data = await response.json();

        if (response.ok && data.access_token) {
            // Token'ı kaydet
            localStorage.setItem(TOKEN_STORAGE_KEY, data.access_token);
            window.location.href = 'lumiphadashboard.html';
        } else {
            alert('⛔ Hatalı Şifre! Lütfen tekrar deneyin.');
            if (loginButton) {
                loginButton.innerText = "Giriş Yap";
                loginButton.disabled = false;
            }
        }

    } catch (error) {
        console.error("Giriş Hatası:", error);
        alert('⚠️ Sunucuya bağlanılamadı. İnternetini kontrol et.');
        if (loginButton) {
            loginButton.innerText = "Giriş Yap";
            loginButton.disabled = false;
        }
    }
}

// 4. Çıkış Yapma Fonksiyonu
function logoutAdmin() {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.location.href = 'admin.html';
}

function markOrderAsSeen(orderId) {
    const SEEN_ORDERS_KEY = 'lumipha_seen_orders';
    let seenList = JSON.parse(localStorage.getItem(SEEN_ORDERS_KEY) || '[]');
    if (!seenList.includes(orderId)) {
        seenList.push(orderId);
        localStorage.setItem(SEEN_ORDERS_KEY, JSON.stringify(seenList));
    }
}

// --- DASHBOARD VERİLERİNİ YÜKLE ---
async function loadDashboardData() {
    const notifyContainer = document.getElementById('notificationsContainer');
    const statActive = document.getElementById('statActiveCount');
    const statPending = document.getElementById('statPendingCount');
    const statPast = document.getElementById('statPastCount');
    const newOrderBadge = document.getElementById('newOrderBadge');
    const newOrderCount = document.getElementById('newOrderCount');

    try {
        const allProjects = await sendApiRequest('/projects', 'GET');
        if (!allProjects) return; // Hata veya oturum yoksa dur

        const waitingList = allProjects.filter(p => p.status === 'WaitingForApproval' || (p.status === 'Pending' && Number(p.totalAmount) === 0));
        const activeList = allProjects.filter(p => p.status === 'InProgress' || (p.status === 'Pending' && Number(p.totalAmount) > 0));
        const pastList = allProjects.filter(p => p.status === 'Completed' || p.status === 'Cancelled');

        if (statActive) statActive.innerText = activeList.length;
        if (statPending) statPending.innerText = waitingList.length;
        if (statPast) statPast.innerText = pastList.length;

        if (newOrderBadge && newOrderCount) {
            if (waitingList.length > 0) {
                newOrderCount.innerText = waitingList.length;
                newOrderBadge.style.display = 'block';
            } else {
                newOrderBadge.style.display = 'none';
            }
        }

        if (notifyContainer) {
            if (waitingList.length === 0) {
                notifyContainer.innerHTML = '<div style="text-align:center; padding:20px; color:#999;">Bekleyen yeni sipariş yok.</div>';
            } else {
                const sortedWaiting = waitingList.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
                let htmlContent = '';

                sortedWaiting.forEach(p => {
                    const names = p.clientName ? p.clientName.split(' ') : ['-', ''];
                    const date = p.startDate ? new Date(p.startDate).toLocaleDateString('tr-TR') : '-';
                    const msg = 'Yeni Sipariş Onay Bekliyor!';
                    const link = 'order-details.html';

                    htmlContent += `
                        <div class="lastnotifications">
                            <div class="idinfo">
                                <span class="nameid">${names[0]} <span class="lastnameid">${names.slice(1).join(' ')}</span></span>
                                <span class="dateid">${date}</span>
                            </div>
                            <div class="isleminfo"><span class="islemtext" style="color:#FF9800; font-weight:bold;">${msg}</span></div>
                            <div class="butonincele"><a href="${link}?id=${p.id}" class="inceletext">Detayı Gör</a></div>
                        </div>`;
                });
                notifyContainer.innerHTML = htmlContent;
            }
        }
    } catch (e) { console.error("Dashboard yenileme hatası:", e); }
}

// --- TÜM BİLDİRİMLER ---
async function fetchAndDisplayNotifications() {
    const notifyContainer = document.getElementById('notificationsListContainer');
    if (!notifyContainer) return;

    try {
        const allProjects = await sendApiRequest('/projects', 'GET');
        if (!allProjects) return;

        const sortedProjects = allProjects.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

        if (sortedProjects.length > 0) {
            notifyContainer.innerHTML = '';
            sortedProjects.forEach(p => {
                const names = p.clientName ? p.clientName.split(' ') : ['-', ''];
                const dateStr = p.startDate ? new Date(p.startDate).toLocaleDateString('tr-TR') : '-';
                const amount = Number(p.totalAmount);
                let message = 'Yeni Talep';
                let targetLink = 'order-details.html';

                if (p.status === 'Completed') { message = 'Tamamlandı'; targetLink = 'orders-past-details.html'; }
                else if (p.status === 'Cancelled') { message = 'İptal Edildi'; targetLink = 'orders-past-details.html'; }
                else if (p.status === 'InProgress') { message = 'Hazırlanıyor'; targetLink = 'active-orders-detail.html'; }
                else if (p.status === 'Pending') {
                    if (amount > 0) { message = 'Ödeme Bekleniyor'; targetLink = 'active-orders-detail.html'; }
                    else { message = 'Fiyat Bekliyor'; targetLink = 'order-details.html'; }
                }
                else if (p.status === 'WaitingForApproval') { message = 'Onay Bekliyor'; targetLink = 'order-details.html'; }

                const itemDiv = document.createElement('div');
                itemDiv.className = 'lastnotifications';

                const idInfoDiv = document.createElement('div');
                idInfoDiv.className = 'idinfo';

                const nameLink = document.createElement('a');
                nameLink.href = `${targetLink}?id=${p.id}`;
                nameLink.className = 'nameid';
                nameLink.textContent = names[0] + ' ';

                const lastNameSpan = document.createElement('span');
                lastNameSpan.className = 'lastnameid';
                lastNameSpan.textContent = names.slice(1).join(' ');
                nameLink.appendChild(lastNameSpan);
                idInfoDiv.appendChild(nameLink);

                const dateLink = document.createElement('a');
                dateLink.href = '#';
                dateLink.className = 'dateid';
                dateLink.textContent = dateStr;
                idInfoDiv.appendChild(dateLink);
                itemDiv.appendChild(idInfoDiv);

                const islemInfoDiv = document.createElement('div');
                islemInfoDiv.className = 'isleminfo';
                const islemTextSpan = document.createElement('span');
                islemTextSpan.className = 'islemtext';
                islemTextSpan.textContent = message;
                islemInfoDiv.appendChild(islemTextSpan);
                itemDiv.appendChild(islemInfoDiv);

                const buttonDiv = document.createElement('div');
                buttonDiv.className = 'butonincele';
                const detailLink = document.createElement('a');
                detailLink.href = `${targetLink}?id=${p.id}`;
                detailLink.className = 'inceletext';
                detailLink.textContent = 'Detayı Gör';
                buttonDiv.appendChild(detailLink);
                itemDiv.appendChild(buttonDiv);

                notifyContainer.appendChild(itemDiv);
            });
        } else { notifyContainer.innerHTML = '<div style="text-align:center;">Kayıt yok.</div>'; }
    } catch (error) { console.error(error); }
}

// --- LİSTELEME FONKSİYONU ---
async function fetchAndDisplayOrders() {
    const container = document.querySelector('.orderscontainer');
    if (!container) return;
    const currentUrl = window.location.href;
    let detailPage = 'order-details.html';
    let filterStatus = [];
    let emptyMsg = 'Sipariş yok.';
    let nameClass = 'orderrequestnameid'; let dateClass = 'orderrequestdateid'; let showStatus = true;

    if (currentUrl.includes('activeorders.html')) {
        filterStatus = ['Pending', 'InProgress'];
        detailPage = 'active-orders-detail.html'; emptyMsg = 'Henüz aktif sipariş yok.';
        nameClass = 'ordernameid'; dateClass = 'orderdateid';
    } else if (currentUrl.includes('orders.html')) {
        filterStatus = ['WaitingForApproval'];
        detailPage = 'order-details.html'; emptyMsg = 'Henüz onay bekleyen talep yok.';
        nameClass = 'orderrequestnameid'; dateClass = 'orderrequestdateid'; showStatus = true;
    } else if (currentUrl.includes('orders-past.html')) {
        filterStatus = ['Completed', 'Cancelled'];
        detailPage = 'orders-past-details.html'; emptyMsg = 'Geçmiş sipariş yok.';
        nameClass = 'ordernameid'; dateClass = 'orderdateid'; showStatus = true;
    }
    container.innerHTML = '<div style="padding:20px; text-align:center;">Yükleniyor...</div>';

    try {
        const allProjects = await sendApiRequest('/projects', 'GET');
        if (!allProjects) { container.innerHTML = 'Oturum hatası veya veri yok.'; return; }

        const filtered = allProjects.filter(p => {
            const amount = Number(p.totalAmount);
            if (filterStatus.includes('WaitingForApproval')) return (p.status === 'WaitingForApproval') || (p.status === 'Pending' && amount === 0);
            if (filterStatus.includes('InProgress')) return p.status === 'InProgress' || (p.status === 'Pending' && amount > 0);
            return filterStatus.includes(p.status);
        });

        if (filtered.length > 0) {
            container.innerHTML = '';
            filtered.forEach(p => {
                const names = p.clientName ? p.clientName.split(' ') : ['-', ''];
                const date = p.startDate ? new Date(p.startDate).toLocaleDateString('tr-TR') : '-';
                let statusText = '';
                if (p.status === 'WaitingForApproval' || (p.status === 'Pending' && Number(p.totalAmount) === 0)) statusText = 'Onay Bekliyor';
                else if (p.status === 'Pending') statusText = 'Ödeme Bekleniyor';
                else if (p.status === 'InProgress') statusText = 'Hazırlanıyor';
                else if (p.status === 'Completed') statusText = 'Tamamlandı';
                else if (p.status === 'Cancelled') statusText = 'İptal Edildi';

                let statusHtml = showStatus ? `<a href="#" class="durumid">${statusText}</a>` : '';
                container.innerHTML += `
                    <div class="order">
                        <div class="orderidinfo">
                            <a href="${detailPage}?id=${p.id}" class="${nameClass}">${names[0]} <span>${names.slice(1).join(' ')}</span></a>
                            <a href="#" class="${dateClass}">${date}</a>
                            ${statusHtml}
                        </div>
                        <div class="ordernumber"><a href="#" class="ordernumbertext">${p.trackingCode}</a></div>
                        <div class="buttonorder"><a href="${detailPage}?id=${p.id}" class="orderbutton">İncele</a></div>
                    </div>`;
            });
        } else { container.innerHTML = `<div style="padding:20px; text-align:center;">${emptyMsg}</div>`; }
    } catch (e) { container.innerHTML = `<div style="color:red; padding:20px; text-align:center;">Hata: ${e.message}</div>`; }
}

// --- 5. DETAY FONKSİYONU (GÜÇLENDİRİLMİŞ) ---
async function fetchOrderDetails(id) {
    console.log("Sipariş detayları çekiliyor, ID:", id);
    if (!id) {
        alert("Hata: URL'de sipariş ID bulunamadı!");
        return;
    }

    try {
        const p = await sendApiRequest(`/projects/${id}`, 'GET');

        if (!p) {
            console.error("Veri gelmedi (null döndü). Token yok veya yetki hatası.");
            alert("Veri yüklenemedi. Lütfen tekrar giriş yapın veya internet bağlantınızı kontrol edin.");
            return;
        }

        // console.log("Backend'den Gelen Veri:", p); // GÜVENLİK: Hassas verileri loglamıyoruz.

        const setTxt = (i, v) => {
            const e = document.getElementById(i);
            if (e) e.innerText = v || '-';
        };

        const fill = (i, v) => {
            const e = document.getElementById(i);
            if (!e) return;
            e.innerText = (v !== null && v !== undefined && v !== '') ? v : '-';
        };

        setTxt('headerTrackingCode', p.trackingCode);
        fill('detailClientName', p.clientName);
        fill('detailCompanyName', p.companyName);
        fill('detailPackage', p.packageName);
        fill('detailBusinessType', p.businessType);
        fill('detailBusinessScale', p.businessScale);

        let contactInfo = p.clientPhone || '-';
        if (p.clientEmail && p.clientEmail !== 'no-email@provided.com') {
            contactInfo += ` / ${p.clientEmail}`;
        }
        fill('detailContact', contactInfo);

        fill('detailTrackingCode', p.trackingCode);

        if (p.startDate) {
            fill('detailDate', new Date(p.startDate).toLocaleDateString('tr-TR'));
        }

        // Mevcut Linki Göster (XSS Korumalı)
        const linkEl = document.getElementById('detailProjectLink');
        if (linkEl) {
            if (p.projectLink) {
                linkEl.innerHTML = ''; // Temizle
                const aIdx = document.createElement('a');
                aIdx.href = p.projectLink.startsWith('http') ? p.projectLink : 'https://' + p.projectLink;
                aIdx.target = '_blank';
                aIdx.style.color = '#FF5722';
                aIdx.textContent = p.projectLink; // Güvenli metin
                linkEl.appendChild(aIdx);
            } else {
                linkEl.innerText = 'Yok';
            }
        }

        setTxt('detailTotalAmount', p.totalAmount);

        let statusText = 'Bilinmiyor';
        const amount = Number(p.totalAmount);
        if (p.status === 'WaitingForApproval' || (p.status === 'Pending' && amount === 0)) statusText = 'Onay Bekliyor';
        else if (p.status === 'Pending') statusText = 'Ödeme Bekleniyor';
        else if (p.status === 'InProgress') statusText = 'Hazırlanıyor';
        else if (p.status === 'Completed') statusText = 'Tamamlandı';
        else if (p.status === 'Cancelled') statusText = 'İptal Edildi';

        setTxt('detailStatus', statusText);
        setTxt('detailStatusText', statusText); // Active Orders Detail sayfası için

        console.log("Veriler başarıyla HTML'e yerleştirildi.");

    } catch (e) {
        console.error("fetchOrderDetails HATASI:", e);
    }
}

// --- SAYFA YÜKLEME YÖNLENDİRMELERİ ---
document.addEventListener('DOMContentLoaded', () => {
    const currentUrl = window.location.href;
    const token = getToken();

    // Giriş sayfasındaysak ve token varsa Dashboard'a at
    if (currentUrl.includes('admin.html') && !currentUrl.includes('lumiphadashboard.html')) {
        if (token) {
            window.location.href = 'lumiphadashboard.html';
        }
        return;
    }

    // Admin paneli sayfaları için yetki kontrolü
    const isAdminPage = currentUrl.includes('lumiphadashboard.html') ||
        currentUrl.includes('notifications.html') ||
        currentUrl.includes('orders') ||
        currentUrl.includes('active-orders') ||
        currentUrl.includes('order-details') ||
        currentUrl.includes('detail');

    if (isAdminPage) {
        if (!token) {
            console.warn("Token bulunamadı, giriş sayfasına yönlendiriliyor...");
            window.location.href = 'admin.html';
            return;
        }

        console.log("Admin.js başlatıldı. URL:", currentUrl);

        if (currentUrl.includes('lumiphadashboard.html')) {
            loadDashboardData();
            setInterval(loadDashboardData, 10000);
        } else if (currentUrl.includes('notifications.html')) {
            fetchAndDisplayNotifications();
        } else if (currentUrl.includes('order-details') || currentUrl.includes('detail')) {
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            if (id) fetchOrderDetails(id);
        } else {
            fetchAndDisplayOrders();
        }
    } else {
        // Tanımsız sayfa ise veya ana sayfa ise (güvenlik için)
        if (!currentUrl.includes('admin.html')) {
            // Bir şey yapma veya yönlendir
        }
    }
});