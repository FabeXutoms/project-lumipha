// admin.js - TÜM DETAYLAR VE EKSİK VERİLER DÜZELTİLDİ

const API_BASE_URL = 'http://localhost:3000';
const API_KEY_STORAGE_KEY = 'lumipha_admin_api_key';

// --- YARDIMCI VE GİRİŞ FONKSİYONLARI ---
function getApiKey() {
    return sessionStorage.getItem(API_KEY_STORAGE_KEY);
}

async function sendApiRequest(endpoint, method = 'GET', body = null) {
    const apiKey = getApiKey();
    if (!apiKey) return null;

    try {
        const headers = { 'Content-Type': 'application/json', 'x-api-key': apiKey };
        const config = { method, headers, body: body ? JSON.stringify(body) : null };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || `Hata: ${response.status}`);
        return data;
    } catch (error) {
        console.error(error);
        throw error; 
    }
}

async function loginAdmin(event) {
    if (event) event.preventDefault();

    const inputEl = document.getElementById('apiKeyInput');
    
    if (!inputEl) { alert('Hata: Giriş kutusu bulunamadı!'); return; }

    const apiKey = inputEl.value.trim();

    if (!apiKey) { alert('Lütfen API Key giriniz!'); return; }

    const loginButton = document.querySelector('.adminbutton');
    if(loginButton) {
        loginButton.innerText = "Kontrol Ediliyor...";
        loginButton.disabled = true;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey }
        });

        if (response.ok) {
            sessionStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
            window.location.href = 'lumiphadashboard.html';
        } else {
            alert('⛔ Hatalı API Key! Lütfen kontrol edip tekrar deneyin.');
            if(loginButton) {
                loginButton.innerText = "Giriş Yap";
                loginButton.disabled = false;
            }
        }

    } catch (error) {
        console.error("Giriş Hatası:", error);
        alert('⚠️ Sunucuya bağlanılamadı. Backend çalışıyor mu?');
        if(loginButton) {
            loginButton.innerText = "Giriş Yap";
            loginButton.disabled = false;
        }
    }
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
        if (!allProjects) return;

        const waitingList = allProjects.filter(p => p.status === 'WaitingForApproval' || (p.status === 'Pending' && Number(p.totalAmount) === 0));
        const activeList = allProjects.filter(p => p.status === 'InProgress' || (p.status === 'Pending' && Number(p.totalAmount) > 0));
        const pastList = allProjects.filter(p => p.status === 'Completed' || p.status === 'Cancelled');

        if(statActive) statActive.innerText = activeList.length;
        if(statPending) statPending.innerText = waitingList.length; 
        if(statPast) statPast.innerText = pastList.length;

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

                const itemHtml = `
                    <div class="lastnotifications">
                        <div class="idinfo">
                            <a href="${targetLink}?id=${p.id}" class="nameid">
                                ${names[0]} <span class="lastnameid">${names.slice(1).join(' ')}</span>
                            </a>
                            <a href="#" class="dateid">${dateStr}</a>
                        </div>
                        <div class="isleminfo"><span class="islemtext">${message}</span></div>
                        <div class="butonincele"><a href="${targetLink}?id=${p.id}" class="inceletext">Detayı Gör</a></div>
                    </div>`;
                notifyContainer.innerHTML += itemHtml;
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
        if (!allProjects) { container.innerHTML = 'Oturum hatası.'; return; }

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

// --- 5. DETAY FONKSİYONU (GÜNCELLENDİ) ---
async function fetchOrderDetails(id) {
    try {
        const p = await sendApiRequest(`/projects/${id}`, 'GET');
        const setTxt = (i, v) => { const e = document.getElementById(i); if (e) e.innerText = v; };
        const setVal = (i, v) => { const e = document.getElementById(i); if (e) e.value = v; };
        const fill = (i, v) => {
            const e = document.getElementById(i); if (!e) return;
            const grp = e.closest('.info-group'); // Eğer bir grup içindeyse
            
            if (v && v !== '' && v !== '-') { 
                e.innerText = v; 
                if (grp) grp.style.display = 'flex'; 
            } else { 
                // Eğer veri yoksa, bazı tasarımlarda gizlemek isteyebilirsin.
                // Şimdilik "Belirtilmemiş" yazalım ki boş görünmesin.
                e.innerText = '-';
                if (grp) grp.style.display = 'flex';
            }
        };

        setTxt('headerTrackingCode', p.trackingCode);
        fill('detailClientName', p.clientName);
        fill('detailCompanyName', p.companyName);
        fill('detailPackage', p.packageName);
        
        // --- GÜNCELLEME 1: İşletme Türü ve Ölçeği Eklendi ---
        fill('detailBusinessType', p.businessType); 
        fill('detailBusinessScale', p.businessScale);

        // --- GÜNCELLEME 2: İletişim Kanalı Birleştirildi ---
        let contactInfo = p.clientPhone || '';
        if (p.clientEmail && p.clientEmail !== 'no-email@provided.com') {
            contactInfo += ` / ${p.clientEmail}`;
        }
        fill('detailContact', contactInfo);
        
        fill('detailTrackingCode', p.trackingCode);
        fill('detailDate', p.startDate ? new Date(p.startDate).toLocaleDateString('tr-TR') : null);
        setTxt('detailTotalAmount', p.totalAmount);

        // Durum Rengi ve Metni
        let statusText = ''; let color = '#FF9800';
        const amount = Number(p.totalAmount);
        
        if (p.status === 'WaitingForApproval' || (p.status === 'Pending' && amount === 0)) { statusText = 'Onay Bekliyor'; color = '#999'; }
        else if (p.status === 'Pending') { statusText = 'Ödeme Bekleniyor'; color = '#FF9800'; }
        else if (p.status === 'InProgress') { statusText = 'Hazırlanıyor'; color = '#2196F3'; }
        else if (p.status === 'Completed') { statusText = 'Tamamlandı'; color = '#4CAF50'; }
        else if (p.status === 'Cancelled') { statusText = 'İptal Edildi'; color = '#F44336'; }

        setTxt('detailStatusText', statusText);
        setTxt('detailStatus', statusText);
        const badge = document.getElementById('currentStatusBadge');
        if (badge) { badge.innerText = statusText; badge.style.backgroundColor = color; }
        setVal('modalStatusSelect', p.status);

        const linkEl = document.getElementById('detailProjectLink');
        if (linkEl) {
            if (p.projectLink && p.projectLink !== '') {
                // Eğer protokol yoksa https:// ekle
                const fullUrl = p.projectLink.startsWith('http://') || p.projectLink.startsWith('https://') 
                    ? p.projectLink 
                    : 'https://' + p.projectLink;
                linkEl.innerHTML = `<a href="${fullUrl}" target="_blank" style="color:#2196F3; text-decoration:underline;">${p.projectLink}</a>`;
            }
            else linkEl.innerText = 'Yok';
        }

        const list = document.getElementById('paymentHistoryList');
        if (list) {
            list.innerHTML = '';
            if (p.payments?.length) {
                p.payments.forEach(pay => {
                    list.innerHTML += `<li><span>${new Date(pay.paymentDate).toLocaleDateString('tr-TR')}</span><strong>${pay.amount} TL</strong></li>`;
                });
            } else { list.innerHTML = '<li>Henüz ödeme yok.</li>'; }
        }
    } catch (e) { console.error(e); }
}

// --- SAYFA YÜKLEME YÖNLENDİRMELERİ ---
document.addEventListener('DOMContentLoaded', () => {
    const currentUrl = window.location.href;

    // Dashboard
    if (currentUrl.includes('lumiphadashboard.html')) {
        if (getApiKey()) {
             loadDashboardData(); 
             setInterval(loadDashboardData, 5000); 
        } else window.location.href = 'admin.html';
    }
    // Notifications
    else if (currentUrl.includes('notifications.html')) {
        if (getApiKey()) fetchAndDisplayNotifications();
        else window.location.href = 'admin.html';
    }
    // Lists (Sipariş Listeleri)
    else if (currentUrl.includes('orders.html') || currentUrl.includes('activeorders.html') || currentUrl.includes('orders-past.html')) {
        if (getApiKey()) fetchAndDisplayOrders();
        else window.location.href = 'admin.html';
    }
    // Details (Detay Sayfaları) - BURAYI EKLEDİM, ARTIK OTOMATİK ÇALIŞIR
    else if (currentUrl.includes('order-details.html') || currentUrl.includes('active-orders-detail.html') || currentUrl.includes('orders-past-details.html')) {
        if (getApiKey()) {
            // URL'den ID'yi al
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('id');
            if (id) fetchOrderDetails(id);
            else alert("ID bulunamadı!");
        } else window.location.href = 'admin.html';
    }
});