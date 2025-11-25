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
    const showModal = (el) => { if (el) el.style.display = 'block'; };
    const hideModal = (el) => { if (el) el.style.display = 'none'; };

    window.onclick = function (event) {
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

            // Ekranda yazan tutarı kontrol et (Sıfır mı değil mi?)
            const amountEl = document.getElementById('detailTotalAmount');
            let amount = 0;
            if (amountEl) {
                // Sayısal değeri al
                amount = parseFloat(amountEl.innerText.replace(/[^0-9.]/g, '')) || 0;
            }

            if (projectId && typeof sendApiRequest === 'function') {
                try {
                    let newStatus = '';
                    let redirectUrl = '';
                    let alertMsg = '';

                    // --- AKILLI YÖNLENDİRME MANTIĞI ---
                    if (amount === 0) {
                        // FİYAT YOKSA -> SİPARİŞ TALEPLERİNE DÖN (Onay Bekliyor)
                        newStatus = 'WaitingForApproval';
                        redirectUrl = `order-details.html?id=${projectId}`;
                        alertMsg = '✅ Sipariş geri alındı ve "Sipariş Talepleri" (Onay Bekleyen) listesine taşındı.';
                    } else {
                        // FİYAT VARSA -> AKTİF SİPARİŞLERE DÖN (İşlemde)
                        newStatus = 'InProgress';
                        redirectUrl = `active-orders-detail.html?id=${projectId}`;
                        alertMsg = '✅ Sipariş geri alındı ve "Aktif Siparişler" listesine taşındı.';
                    }

                    // Backend'e durumu güncelle
                    await sendApiRequest(`/projects/${projectId}/status`, 'POST', { status: newStatus });

                    alert(alertMsg);
                    window.location.href = redirectUrl;

                } catch (err) {
                    alert('Hata: ' + err.message);
                }
            } else {
                alert('Hata: API bağlantısı yok.');
            }
        });
    }

    // --- 2. LİNK DEĞİŞTİRME İŞLEMLERİ ---
    if (linkDegistirBtn) {
        linkDegistirBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const mevcutLinkEl = document.getElementById('detailProjectLink');
            if (mevcutLinkEl && linkInput) {
                const mevcutText = mevcutLinkEl.innerText.trim();
                if (mevcutText !== 'Yok' && mevcutText !== '...') {
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
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');

            if (projectId && typeof sendApiRequest === 'function') {
                try {
                    // Linki Güncelle (Boş ise siler)
                    await sendApiRequest(`/projects/${projectId}`, 'PATCH', {
                        projectLink: yeniLink
                    });

                    const linkDisplay = document.getElementById('detailProjectLink');
                    if (linkDisplay) {
                        if (yeniLink) {
                            linkDisplay.innerHTML = `<a href="${yeniLink}" target="_blank" style="color:#2196F3; text-decoration:underline;">${yeniLink}</a>`;
                            alert('✅ Link güncellendi!');
                        } else {
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