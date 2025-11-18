document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTLER ---
    const geriAlBtn = document.getElementById('siparisiGeriAlBtn');
    const geriAlModal = document.getElementById('geriAlModal');
    const geriAlEvet = document.getElementById('geriAlEvet');
    const geriAlHayir = document.getElementById('geriAlHayir');
    
    const linkDegistirBtn = document.getElementById('linkDegistir');
    const inputModal = document.getElementById('input-modal');
    const saveLinkBtn = document.getElementById('saveLinkBtn');
    const linkInput = document.getElementById('linkInput');

    // --- YARDIMCI FONKSİYONLAR ---
    const showModal = (el) => { if(el) el.style.display = 'block'; };
    const hideModal = (el) => { if(el) el.style.display = 'none'; };

    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) event.target.style.display = 'none';
    }
    
    const modalContents = document.querySelectorAll('.modal-icerik-geriAl, .modal-input-icerik');
    modalContents.forEach(el => el.addEventListener('click', e => e.stopPropagation()));

    // --- 1. GERİ ALMA İŞLEMLERİ ---
    if (geriAlBtn) {
        geriAlBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal(geriAlModal);
        });
    }

    if (geriAlHayir) {
        geriAlHayir.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal(geriAlModal);
        });
    }

    if (geriAlEvet) {
        geriAlEvet.addEventListener('click', async (e) => {
            e.preventDefault();
            hideModal(geriAlModal);
            
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');

            if (projectId && typeof sendApiRequest === 'function') {
                try {
                    await sendApiRequest(`/projects/${projectId}/status`, 'POST', { status: 'InProgress' });
                    alert('✅ Sipariş geri alındı ve Aktif Siparişler\'e taşındı.');
                    window.location.href = `active-orders-detail.html?id=${projectId}`;
                } catch (err) {
                    alert('Hata: ' + err.message);
                }
            }
        });
    }

    // --- 2. LİNK DEĞİŞTİRME İŞLEMLERİ (DİNAMİK GÜNCELLEME) ---
    if (linkDegistirBtn) {
        linkDegistirBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Mevcut linki inputa getir (Varsa)
            const mevcutLinkEl = document.getElementById('detailProjectLink');
            if(mevcutLinkEl && linkInput) {
                const mevcutText = mevcutLinkEl.innerText.trim();
                if(mevcutText !== 'Yok' && mevcutText !== '...') {
                    linkInput.value = mevcutText;
                } else {
                    linkInput.value = '';
                }
            }
            showModal(inputModal);
        });
    }
    
    if (saveLinkBtn) {
        saveLinkBtn.addEventListener('click', async (e) => {
             e.preventDefault();
             
             const yeniLink = linkInput.value.trim();
             
             if(!yeniLink) {
                 alert("Lütfen geçerli bir link giriniz.");
                 return;
             }

             // --- BACKEND'E KAYIT (İsteğe Bağlı) ---
             // Şu an 'projectLink' diye bir alanımız yok, o yüzden sadece Ekranda güncelliyoruz.
             // İleride eklersen: await sendApiRequest(..., 'PATCH', { projectLink: yeniLink });

             // --- EKRANI GÜNCELLE (Dinamik Değişim) ---
             const linkDisplay = document.getElementById('detailProjectLink');
             if(linkDisplay) {
                 // Linki tıklanabilir yapalım mı? İstersen sadece metin olarak da kalabilir.
                 // Şimdilik sadece metin olarak güncelliyoruz:
                 linkDisplay.innerText = yeniLink;
             }

             alert('Link başarıyla güncellendi!');
             hideModal(inputModal);
        });
    }
});