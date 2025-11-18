// admin.js - YENİ ONAY AKIŞI SÜRÜMÜ

const API_BASE_URL = 'http://localhost:3000';
const API_KEY_STORAGE_KEY = 'lumipha_admin_api_key';

function getApiKey() { return sessionStorage.getItem(API_KEY_STORAGE_KEY); }

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
    } catch (error) { console.error(error); throw error; }
}

function loginAdmin() {
    const input = document.getElementById('password') || document.getElementById('apiKeyInput');
    if (!input || !input.value.trim()) { alert('API Key giriniz!'); return; }
    sessionStorage.setItem(API_KEY_STORAGE_KEY, input.value.trim());
    window.location.href = 'lumiphadashboard.html';
}

// --- LİSTELEME FONKSİYONU ---
async function fetchAndDisplayOrders() {
    const container = document.querySelector('.orderscontainer');
    if (!container) return;

    const currentUrl = window.location.href;
    let detailPage = 'order-details.html';
    let filterStatus = [];
    let emptyMsg = 'Sipariş yok.';
    
    let nameClass = 'orderrequestnameid'; 
    let dateClass = 'orderrequestdateid'; 
    let showStatus = true; 

    if (currentUrl.includes('activeorders.html')) {
        // AKTİF SİPARİŞLER: Ödeme Bekleyenler (Pending) VE İşlemde Olanlar (InProgress)
        filterStatus = ['Pending', 'InProgress']; 
        detailPage = 'active-orders-detail.html';
        emptyMsg = 'Henüz aktif sipariş yok.';
        nameClass = 'ordernameid';
        dateClass = 'orderdateid';
        showStatus = true; 
    } else if (currentUrl.includes('orders.html')) {
        // SİPARİŞ TALEPLERİ: Sadece Onay Bekleyenler
        filterStatus = ['WaitingForApproval']; 
        detailPage = 'order-details.html';
        emptyMsg = 'Henüz onay bekleyen talep yok.';
        nameClass = 'orderrequestnameid';
        dateClass = 'orderrequestdateid';
        showStatus = true; // İstersen burada "Onay Bekliyor" yazdırabilirsin, yoksa false yap
    } else if (currentUrl.includes('orders-past.html')) {
        filterStatus = ['Completed', 'Cancelled'];
        detailPage = 'orders-past-details.html';
        emptyMsg = 'Geçmiş sipariş yok.';
        nameClass = 'ordernameid';
        dateClass = 'orderdateid';
        showStatus = true;
    }

    container.innerHTML = '<div style="padding:20px; text-align:center;">Yükleniyor...</div>';

    try {
        const allProjects = await sendApiRequest('/projects', 'GET');
        if (!allProjects) { container.innerHTML = 'Oturum hatası.'; return; }

        const filtered = allProjects.filter(p => filterStatus.includes(p.status));

        if (filtered.length > 0) {
            container.innerHTML = '';
            filtered.forEach(p => {
                const names = p.clientName ? p.clientName.split(' ') : ['-', ''];
                const date = p.startDate ? new Date(p.startDate).toLocaleDateString('tr-TR') : '-';
                
                // --- DURUM METİNLERİ ---
                let statusText = '';
                let statusClass = 'durumid';

                if (p.status === 'WaitingForApproval') statusText = 'Sipariş Onay Bekliyor';
                else if (p.status === 'Pending') statusText = 'Ödeme Bekleniyor';
                else if (p.status === 'InProgress') statusText = 'İşlemde';
                else if (p.status === 'Completed') statusText = 'Tamamlandı';
                else if (p.status === 'Cancelled') statusText = 'İptal Edildi';

                let statusHtml = showStatus ? `<a href="#" class="${statusClass}">${statusText}</a>` : '';

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
        } else {
            container.innerHTML = `<div style="padding:20px; text-align:center;">${emptyMsg}</div>`;
        }
    } catch (e) {
        container.innerHTML = `<div style="color:red; padding:20px; text-align:center;">Hata: ${e.message}</div>`;
    }
}

// --- DETAY FONKSİYONU ---
async function fetchOrderDetails(id) {
    try {
        const p = await sendApiRequest(`/projects/${id}`, 'GET');
        const setTxt = (i, v) => { const e = document.getElementById(i); if(e) e.innerText = v; };
        const setVal = (i, v) => { const e = document.getElementById(i); if(e) e.value = v; };
        const fill = (i, v) => {
            const e = document.getElementById(i); if(!e) return;
            const grp = e.closest('.info-group');
            if(v && v!=='' && v!=='-') { e.innerText = v; if(grp) grp.style.display = 'flex'; }
            else { if(grp) grp.style.display = 'none'; }
        };

        setTxt('headerTrackingCode', p.trackingCode);
        fill('detailClientName', p.clientName);
        fill('detailCompanyName', p.companyName);
        fill('detailPackage', p.packageName);
        fill('detailContact', p.clientEmail || p.clientPhone);
        fill('detailTrackingCode', p.trackingCode);
        fill('detailDate', p.startDate ? new Date(p.startDate).toLocaleDateString('tr-TR') : null);
        setTxt('detailTotalAmount', p.totalAmount);

        // --- DURUM MANTIĞI ---
        let statusText = p.status;
        let color = '#FF9800';

        if (p.status === 'WaitingForApproval') { statusText = 'Sipariş Onay Bekliyor'; color = '#999'; }
        else if (p.status === 'Pending') { statusText = 'Ödeme Bekleniyor'; color = '#FF9800'; }
        else if (p.status === 'InProgress') { statusText = 'İşlemde'; color = '#2196F3'; }
        else if (p.status === 'Completed') { statusText = 'Tamamlandı'; color = '#4CAF50'; }
        else if (p.status === 'Cancelled') { statusText = 'İptal Edildi'; color = '#F44336'; }

        setTxt('detailStatusText', statusText);
        setTxt('detailStatus', statusText); // order-details için
        
        const badge = document.getElementById('currentStatusBadge');
        if(badge) { badge.innerText = statusText; badge.style.backgroundColor = color; }

        setVal('modalStatusSelect', p.status);
        
        const linkEl = document.getElementById('detailProjectLink');
        if(linkEl) linkEl.innerText = 'Yok'; 
        
        // Ödemeler
        const list = document.getElementById('paymentHistoryList');
        if(list) {
            list.innerHTML = '';
            if(p.payments?.length) {
                p.payments.forEach(pay => {
                    list.innerHTML += `<li><span>${new Date(pay.paymentDate).toLocaleDateString('tr-TR')}</span><strong>${pay.amount} TL</strong></li>`;
                });
            } else { list.innerHTML = '<li>Ödeme yok.</li>'; }
        }
    } catch (e) { console.error(e); }
}