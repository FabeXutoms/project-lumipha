document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SEÇİMLERİ ---
    const fiyatBelirleOnaylaBtn = document.getElementById('fiyatBelirleOnayla');
    const siparisSilBtn = document.getElementById('siparisSil');

    const onayModal = document.getElementById('onayModal');
    const silOnayModal = document.getElementById('silOnayModal');
    const fiyatModal = document.getElementById('fiyatModal');
    const islemOnayModal = document.getElementById('islemOnayModal');

    const silModalEvet = document.getElementById('silModalEvet');
    const silModalHayir = document.getElementById('silModalHayir');

    const fiyatInput = document.getElementById('fiyatInput');
    const fiyatOnaylaButonu = document.getElementById('fiyatOnaylaButonu');

    const islemModalEvet = document.getElementById('islemModalEvet');
    const islemModalHayir = document.getElementById('islemModalHayir');

    const readyButonu = document.getElementById('readyButonu');
    const completedButonu = document.getElementById('completedButonu');

    // --- YARDIMCI FONKSİYONLAR ---
    const showModal = (modalElement) => {
        if (modalElement) modalElement.style.display = 'block';
    };

    const hideModal = (modalElement) => {
        if (modalElement) modalElement.style.display = 'none';
    };

    // Pencere dışına tıklayınca kapatma
    window.onclick = function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    }

    // Modal içeriğine tıklamayı koru
    const tumModalIcerikleri = document.querySelectorAll('.modal-icerik, .modal-fiyat-icerik, .modal-son-icerik');
    tumModalIcerikleri.forEach(icerik => {
        icerik.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });

    // --- ENTER TUŞU DESTEĞİ ---
    if (fiyatInput && fiyatOnaylaButonu) {
        fiyatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                fiyatOnaylaButonu.click();
            }
        });
    }

    // --- BUTON OLAYLARI ---

    // 1. Fiyat Belirle Modali Aç
    if (fiyatBelirleOnaylaBtn) {
        fiyatBelirleOnaylaBtn.addEventListener('click', (e) => {
            e.preventDefault();

            // Mevcut fiyatı inputa getir (varsa)
            const mevcutFiyatEl = document.getElementById('detailTotalAmount');
            if (mevcutFiyatEl && fiyatInput) {
                const fiyatText = mevcutFiyatEl.innerText.replace(/[^0-9.,]/g, '').trim();
                if (fiyatText && !isNaN(parseFloat(fiyatText))) {
                    fiyatInput.value = parseFloat(fiyatText);
                } else {
                    fiyatInput.value = '';
                }
            }
            showModal(fiyatModal);
        });
    }

    // 2. Sipariş Sil Modali Aç
    if (siparisSilBtn) {
        siparisSilBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showModal(silOnayModal);
        });
    }

    // 3. Fiyat Onay Butonu (Ara Adım)
    if (fiyatOnaylaButonu) {
        fiyatOnaylaButonu.addEventListener('click', (e) => {
            e.preventDefault();
            const fiyat = fiyatInput.value;
            if (fiyat === "" || isNaN(fiyat) || parseFloat(fiyat) < 0) {
                alert("Lütfen geçerli bir fiyat girin.");
                return;
            }

            hideModal(fiyatModal);
            showModal(islemOnayModal);
        });
    }

    // 4. SON ONAY VE AKTİF SİPARİŞE GEÇİŞ (FİYAT)
    if (islemModalEvet) {
        islemModalEvet.addEventListener('click', async (e) => {
            e.preventDefault();
            hideModal(islemOnayModal);

            const belirlenenFiyat = parseFloat(fiyatInput.value);
            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');

            if (projectId && typeof sendApiRequest === 'function') {
                try {
                    // Fiyatı Güncelle
                    await sendApiRequest(`/projects/${projectId}`, 'PATCH', { totalAmount: belirlenenFiyat });

                    // Durumu 'Pending' (Ödeme Bekleniyor) yap -> Aktif Listeye düşer
                    await sendApiRequest(`/projects/${projectId}/status`, 'POST', { status: 'Pending' });

                    // Görüldü işaretini kaldır (Tekrar bildirim olsun)
                    if (typeof markOrderAsUnseen === 'function') markOrderAsUnseen(projectId);

                    alert(`✅ Fiyat onaylandı! Sipariş "Aktif Siparişler" listesine taşındı.`);
                    window.location.href = `active-orders-detail.html?id=${projectId}`;

                } catch (error) {
                    alert("Hata: " + error.message);
                }
            }
        });
    }

    // 5. SİPARİŞİ SİLME (İPTAL ETME) İŞLEMİ -- GÜNCELLENDİ --
    if (silModalEvet) {
        silModalEvet.addEventListener('click', async (e) => {
            e.preventDefault();
            hideModal(silOnayModal);

            const urlParams = new URLSearchParams(window.location.search);
            const projectId = urlParams.get('id');

            if (projectId && typeof sendApiRequest === 'function') {
                try {
                    // ESKİ (TEHLİKELİ): await sendApiRequest(`/projects/${projectId}`, 'DELETE');

                    // YENİ (GÜVENLİ): Durumu 'Cancelled' yap (Geçmiş Siparişlere Düşer)
                    await sendApiRequest(`/projects/${projectId}/status`, 'POST', {
                        status: 'Cancelled'
                    });

                    // Görüldü işaretini kaldır (Bildirim olsun)
                    if (typeof markOrderAsUnseen === 'function') markOrderAsUnseen(projectId);

                    alert('🗑️ Sipariş iptal edildi ve "Geçmiş Siparişler" listesine taşındı.');

                    // Geçmiş Siparişler Listesine Yönlendir
                    window.location.href = 'orders-past.html';

                } catch (error) {
                    alert("Hata: " + error.message);
                }
            } else {
                alert('Hata: API bağlantısı yok veya ID bulunamadı.');
            }
        });
    }

    // --- DİĞER İPTAL/KAPAT BUTONLARI ---
    if (silModalHayir) {
        silModalHayir.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal(silOnayModal);
        });
    }

    if (islemModalHayir) {
        islemModalHayir.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal(islemOnayModal);
            showModal(fiyatModal); // Geri dön
        });
    }

    if (readyButonu) {
        readyButonu.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal(onayModal);
            alert('Sipariş durumu güncellendi.');
        });
    }

    if (completedButonu) {
        completedButonu.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal(onayModal);
            alert('Sipariş durumu güncellendi.');
        });
    }
});