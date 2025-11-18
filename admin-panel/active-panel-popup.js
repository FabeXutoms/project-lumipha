document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SEÇİMLERİ ---
    const siparisBitirBtn = document.getElementById('siparisBitirBtn');
    const siparisSilBtn = document.getElementById('siparisSilBtn');
    
    const onayModal = document.getElementById('onayModal');
    const silOnayModal = document.getElementById('sonModal');
    const durumModal = document.getElementById('durumModal');
    const inputModal = document.getElementById('input-modal');

    // Modal İçi Butonlar
    const completedButonu = document.getElementById('completedButonu');
    const cancelCompleteBtn = document.getElementById('cancelCompleteBtn');
    const sonModalEvet = document.getElementById('sonModalEvet');
    const sonModalHayir = document.getElementById('sonModalHayir');

    // Durum ve Link Elemanları
    const durumUpdateBtn = document.getElementById('durum-update-button');
    const saveStatusBtn = document.getElementById('saveStatusBtn');
    const modalStatusSelect = document.getElementById('modalStatusSelect');

    const linkBtn = document.getElementById('durum-link-button');
    const saveLinkBtn = document.getElementById('saveLinkBtn');
    const linkInput = document.getElementById('linkInput');

    // --- YARDIMCI FONKSİYONLAR ---
    const showModal = (el) => { if(el) el.style.display = 'block'; };
    const hideModal = (el) => { if(el) el.style.display = 'none'; };

    // Link Kontrolü
    const checkLinkExists = () => {
        const linkEl = document.getElementById('detailProjectLink');
        if (!linkEl) return false;
        const linkText = linkEl.innerText.trim();
        return !(linkText === 'Yok' || linkText === '...' || linkText === '' || linkText === '-');
    };

    // Pencere Dışı Tıklama
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    }

    const modalContents = document.querySelectorAll('.modal-icerik, .modal-input-icerik, .modal-son-icerik');
    modalContents.forEach(el => el.addEventListener('click', e => e.stopPropagation()));

    // --- 1. SİPARİŞİ BİTİRME ---
    if(siparisBitirBtn) {
        siparisBitirBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (!checkLinkExists()) {
                alert('⚠️ Siparişi bitirmeden önce lütfen proje linkini giriniz!');
                showModal(inputModal);
                return;
            }
            showModal(onayModal);
        });
    }

    if(completedButonu) {
        completedButonu.addEventListener('click', async (e) => {
            e.preventDefault();
            if (!checkLinkExists()) {
                hideModal(onayModal);
                alert('⚠️ Lütfen önce proje linkini giriniz!');
                showModal(inputModal);
                return;
            }
            hideModal(onayModal);
            
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');

            if(projectId && typeof sendApiRequest === 'function') {
                try {
                    await sendApiRequest(`/projects/${projectId}/status`, 'POST', { status: 'Completed' });
                    alert('✅ Sipariş tamamlandı ve Geçmiş Siparişler\'e taşındı!');
                    window.location.href = `orders-past-details.html?id=${projectId}`;
                } catch(err) { alert('Hata: ' + err.message); }
            }
        });
    }

    if(cancelCompleteBtn) cancelCompleteBtn.addEventListener('click', (e) => { e.preventDefault(); hideModal(onayModal); });

    // --- 2. DURUM GÜNCELLEME (ÖZEL MANTIK EKLENDİ) ---
    if(durumUpdateBtn) {
        durumUpdateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal(durumModal);
        });
    }

    if (saveStatusBtn) {
        saveStatusBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            
            const newStatus = document.getElementById('modalStatusSelect').value;
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');

            if (projectId && typeof sendApiRequest === 'function') {
                try {
                    // Seçilen durumu veritabanına kaydet (Pending, InProgress vs.)
                    await sendApiRequest(`/projects/${projectId}/status`, 'POST', { status: newStatus });
                    
                    alert('✅ Durum güncellendi!');
                    hideModal(document.getElementById('durumModal'));

                    if(newStatus === 'Completed' || newStatus === 'Cancelled') {
                        window.location.href = `orders-past-details.html?id=${projectId}`;
                    } 
                    else if(newStatus === 'Pending') {
                        // Eğer Aktif Detay sayfasındayken tekrar "Ödeme Bekleniyor" seçilirse
                        // Veritabanı 'Pending' olur, ama Fiyat > 0 olduğu için
                        // admin.js bunu hala Aktif Siparişler listesinde gösterir.
                        // Yani sayfa değişmez, sadece yazı "Ödeme Bekleniyor" olur.
                        location.reload();
                    } 
                    else {
                        // InProgress (İşlemde) seçildiyse
                        location.reload();
                    }
                } catch(err) {
                    alert('Hata: ' + err.message);
                }
            }
        });
    }
    // --- 3. SİPARİŞ SİLME ---
    if(siparisSilBtn) siparisSilBtn.addEventListener('click', (e) => { e.preventDefault(); showModal(silOnayModal); });

    if(sonModalEvet) {
        sonModalEvet.addEventListener('click', async (e) => {
            e.preventDefault();
            hideModal(silOnayModal);
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');
            try {
                await sendApiRequest(`/projects/${projectId}/status`, 'POST', { status: 'Cancelled' });
                alert('🗑️ Sipariş iptal edildi ve Geçmiş Siparişler\'e taşındı.');
                window.location.href = `orders-past.html`;
            } catch(err) { alert('Hata: ' + err.message); }
        });
    }
    if(sonModalHayir) sonModalHayir.addEventListener('click', (e) => { e.preventDefault(); hideModal(silOnayModal); });

    // --- 4. LINK PAYLAŞMA ---
    if(linkBtn) {
        linkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const mevcutLink = document.getElementById('detailProjectLink');
            if(mevcutLink && linkInput) {
                const text = mevcutLink.innerText.trim();
                linkInput.value = (text !== 'Yok' && text !== '...') ? text : '';
            }
            showModal(inputModal);
        });
    }

    if(saveLinkBtn) {
        saveLinkBtn.addEventListener('click', (e) => {
             e.preventDefault();
             const yeniLink = linkInput.value.trim();
             if (!yeniLink) { alert("Lütfen link girin."); return; }
             
             const linkDisplay = document.getElementById('detailProjectLink');
             if(linkDisplay) linkDisplay.innerText = yeniLink;
             
             alert('Link eklendi!');
             hideModal(inputModal);
        });
    }
});