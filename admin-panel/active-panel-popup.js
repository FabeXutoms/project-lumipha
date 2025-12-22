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
    const showModal = (el) => { if (el) el.style.display = 'block'; };
    const hideModal = (el) => { if (el) el.style.display = 'none'; };

    // --- LİNK KONTROLÜ (YENİ) ---
    const checkLinkExists = () => {
        const linkEl = document.getElementById('detailProjectLink');
        if (!linkEl) return false;

        const linkText = linkEl.innerText.trim();
        // Link alanı boşsa veya varsayılan değerlerse "Yok" sayılır
        return !(linkText === 'Yok' || linkText === '...' || linkText === '' || linkText === '-');
    };

    // Dışarı tıklayınca kapatma
    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    }

    const modalContents = document.querySelectorAll('.modal-icerik, .modal-input-icerik, .modal-son-icerik');
    modalContents.forEach(el => el.addEventListener('click', e => e.stopPropagation()));

    // --- 1. SİPARİŞİ BİTİRME BUTONU ---
    if (siparisBitirBtn) {
        siparisBitirBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // KONTROL: Link girilmiş mi?
            if (!checkLinkExists()) {
                alert('⚠️ Siparişi tamamlamadan önce lütfen PROJE LİNKİNİ giriniz!');
                // Kolaylık olsun diye direkt Link Ekleme penceresini açıyoruz
                showModal(inputModal);
                return;
            }

            showModal(onayModal);
        });
    }

    // Onay Modalindeki "Evet, Tamamla" butonu
    if (completedButonu) {
        completedButonu.addEventListener('click', async (e) => {
            e.preventDefault();

            // Çift dikiş kontrol (Modal açıkken link silinirse diye)
            if (!checkLinkExists()) {
                hideModal(onayModal);
                alert('⚠️ Lütfen önce proje linkini ekleyin!');
                showModal(inputModal);
                return;
            }

            hideModal(onayModal);

            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');

            if (projectId && typeof sendApiRequest === 'function') {
                try {
                    await sendApiRequest(`/projects/${projectId}/status`, 'POST', { status: 'Completed' });
                    alert('✅ Sipariş tamamlandı ve Geçmiş Siparişler\'e taşındı!');
                    window.location.href = `orders-past-details.html?id=${projectId}`;
                } catch (err) { alert('Hata: ' + err.message); }
            }
        });
    }

    if (cancelCompleteBtn) cancelCompleteBtn.addEventListener('click', (e) => { e.preventDefault(); hideModal(onayModal); });

    // --- 2. DURUM GÜNCELLEME BUTONU ---
    if (durumUpdateBtn) {
        durumUpdateBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal(durumModal);
        });
    }

    if (saveStatusBtn) {
        saveStatusBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            const newStatus = modalStatusSelect.value;

            // KONTROL: Eğer "Tamamlandı" seçildiyse Link zorunlu!
            if (newStatus === 'Completed') {
                if (!checkLinkExists()) {
                    hideModal(durumModal); // Durum modalini kapat
                    alert('⚠️ Siparişi "Tamamlandı" durumuna getirmek için önce LİNK girmelisiniz!');
                    showModal(inputModal); // Link modalini aç
                    return;
                }
            }

            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');

            if (projectId && typeof sendApiRequest === 'function') {
                try {
                    await sendApiRequest(`/projects/${projectId}/status`, 'POST', { status: newStatus });

                    alert('✅ Durum güncellendi!');
                    hideModal(durumModal);

                    // Yönlendirmeler
                    if (newStatus === 'Completed' || newStatus === 'Cancelled') {
                        window.location.href = `orders-past-details.html?id=${projectId}`;
                    } else if (newStatus === 'Pending') {
                        // Pending seçilse bile Active sayfasında kalması için reload yeterli
                        // (Çünkü admin.js fiyat olduğu için onu Active listesinde gösterecek)
                        // Ama sen Orders sayfasına dönmesini istersen: window.location.href = 'orders.html';
                        location.reload();
                    } else {
                        location.reload();
                    }
                } catch (err) { alert('Hata: ' + err.message); }
            }
        });
    }

    // --- 3. SİPARİŞ SİLME ---
    if (siparisSilBtn) siparisSilBtn.addEventListener('click', (e) => { e.preventDefault(); showModal(silOnayModal); });

    if (sonModalEvet) {
        sonModalEvet.addEventListener('click', async (e) => {
            e.preventDefault();
            hideModal(silOnayModal);
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');
            try {
                await sendApiRequest(`/projects/${projectId}/status`, 'POST', { status: 'Cancelled' });
                alert('🗑️ Sipariş iptal edildi ve Geçmiş Siparişler\'e taşındı.');
                window.location.href = `orders-past.html`;
            } catch (err) { alert('Hata: ' + err.message); }
        });
    }
    if (sonModalHayir) sonModalHayir.addEventListener('click', (e) => { e.preventDefault(); hideModal(silOnayModal); });

    // --- 4. LINK PAYLAŞMA ---
    if (linkBtn) {
        linkBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const mevcutLink = document.getElementById('detailProjectLink');
            if (mevcutLink && linkInput) {
                const text = mevcutLink.innerText.trim();
                linkInput.value = (text !== 'Yok' && text !== '...') ? text : '';
            }
            showModal(inputModal);
        });
    }

    if (saveLinkBtn) {
        saveLinkBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            let yeniLink = linkInput.value.trim();
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');

            // URL'nin başındaki localhost/IP'yi temizle (eğer varsa)
            if (yeniLink) {
                yeniLink = yeniLink.replace(/^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?\//, '');
            }

            if (projectId && typeof sendApiRequest === 'function') {
                try {
                    // BACKEND'E KAYIT (PATCH İSTEĞİ)
                    // Eğer yeniLink boşsa (""), veritabanındaki link de temizlenir.
                    await sendApiRequest(`/projects/${projectId}`, 'PATCH', {
                        projectLink: yeniLink
                    });

                    // EKRANI GÜNCELLE
                    const linkDisplay = document.getElementById('detailProjectLink');
                    if (linkDisplay) {
                        if (yeniLink) {
                            // Link varsa temizle ve güvenli şekilde oluştur
                            linkDisplay.innerHTML = '';
                            const fullUrl = yeniLink.startsWith('http://') || yeniLink.startsWith('https://')
                                ? yeniLink
                                : 'https://' + yeniLink;

                            const aTag = document.createElement('a');
                            aTag.href = fullUrl;
                            aTag.target = "_blank";
                            aTag.style.color = "#2196F3";
                            aTag.style.textDecoration = "underline";
                            aTag.textContent = yeniLink; // XSS Korumalı

                            linkDisplay.appendChild(aTag);
                            alert('✅ Link güncellendi!');
                        } else {
                            // Link boşsa "Yok" yaz
                            linkDisplay.innerText = 'Yok';
                            alert('🗑️ Link silindi!');
                        }
                    }

                    hideModal(inputModal);

                } catch (error) {
                    alert("Hata: " + error.message);
                }
            } else {
                alert("Hata: API bağlantısı yok.");
            }
        });
    }
});