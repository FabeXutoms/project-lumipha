// orders-code.js - FİNAL VE DİNAMİK SÜRÜM
// Relative path kullanıyoruz - CORS sorunu olmaz

// Sayıyı 1000 ayırıcısı ile formatlayan fonksiyon (15000 -> 15.000)
const formatTurkishNumber = (num) => {
    if (num === null || num === undefined) return '';
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

document.addEventListener('DOMContentLoaded', () => {
    // Elementleri Seç
    const section1 = document.querySelector('.orders-content');
    const section2 = document.querySelector('.orders-content-second');
    const errorSection = document.getElementById('errorBox');

    const nextBtn = document.getElementById('nextButton');
    const backBtn = document.getElementById('backButton');
    const buttonContainer = document.getElementById('buttonContainer');
    const nextBtnTitle = document.querySelector('.nextbuttontitle');

    const codeInput = document.getElementById('orderCodeInput');

    // Başlangıç Ayarı
    section1.style.display = 'block';
    section2.style.display = 'none';
    errorSection.style.display = 'none';

    // URL'den kod parametresini oku ve input'a yaz (tek seferlik)
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    if (codeFromUrl && codeInput) {
        codeInput.value = codeFromUrl;
        // URL'den parametreyi temizle (sayfa yenilendiğinde tekrar yazılmasın)
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // --- İLERLE BUTONU ---
    nextBtn.addEventListener('click', async () => {
        // Eğer 2. sayfadaysak (Destek Al modu)
        if (buttonContainer.classList.contains('step-two-active')) {
            // Destek linkine yönlendirme yapılabilir
            return;
        }

        const trackingCode = codeInput.value.trim();

        if (!trackingCode) {
            alert("Lütfen bir sipariş kodu giriniz.");
            return;
        }

        // Kilitle
        const originalText = nextBtnTitle.textContent;
        nextBtnTitle.textContent = "Kontrol...";
        nextBtn.disabled = true;

        try {
            // API'ye Sor
            const response = await fetch(`https://project-lumipha.onrender.com/tracking/${encodeURIComponent(trackingCode)}`);

            if (!response.ok) {
                throw new Error("Sipariş bulunamadı");
            }

            const data = await response.json();

            // Verileri Doldur
            populateOrderData(data);

            // Ekran Değiştir
            section1.style.opacity = '0';
            errorSection.style.display = 'none';

            setTimeout(() => {
                section1.style.display = 'none';
                section2.style.display = 'block';
                setTimeout(() => {
                    section2.style.opacity = '1';
                }, 50);
            }, 300);

            // Buton Değişimi
            buttonContainer.classList.add('step-two-active');
            nextBtnTitle.textContent = "Destek Al";

        } catch (error) {
            console.error(error);
            section1.style.display = 'none';
            section2.style.display = 'none';
            errorSection.style.display = 'block';
        } finally {
            nextBtn.disabled = false;
            if (!buttonContainer.classList.contains('step-two-active')) {
                nextBtnTitle.textContent = originalText;
            }
        }
    });

    // --- GERİ DÖN BUTONU ---
    backBtn.addEventListener('click', () => {
        section2.style.opacity = '0';
        errorSection.style.display = 'none';

        setTimeout(() => {
            section2.style.display = 'none';
            section1.style.display = 'block';
            setTimeout(() => {
                section1.style.opacity = '1';
            }, 50);
        }, 300);

        buttonContainer.classList.remove('step-two-active');
        nextBtnTitle.textContent = "İlerle";
        codeInput.value = '';

        // Back butonunun inline style'ını temizle, CSS'in kontrolüne bırak
        backBtn.style.display = '';
        nextBtn.style.display = '';
    });

    // --- VERİ DOLDURMA ---
    function populateOrderData(data) {
        // Şirket adı varsa onu, yoksa müşteri adını, o da yoksa "Müşteri" yaz
        const ownerName = data.companyName || data.clientName || "Müşteri";

        setText('displayOwnerName', ownerName);
        setText('displayServiceName', data.packageName);

        setText('contactName', data.clientName);
        setText('contactPhone', data.clientPhone || '-');
        setText('contactEmail', data.clientEmail || '-');

        // Download Butonunu Kontrol Et
        const downloadLink = document.querySelector('.downloadlink');

        // Durum Açıklaması
        const statusDescriptionEl = document.getElementById('statusDescription');
        let statusDescription = '';

        // Durum Görselleri
        const imgCompleted = document.getElementById('imgCompleted');
        const imgOnOrder = document.getElementById('imgOnOrder');
        const imgPayment = document.getElementById('imgPayment');
        const imgOrderPlaced = document.getElementById('imgOrderPlaced');
        const imgCanceled = document.getElementById('imgCanceled');

        // Butonları Kontrol Et
        const paymentButtonContainer = document.getElementById('paymentButtonContainer');
        const nextBtn = document.getElementById('nextButton');
        const backBtn = document.getElementById('backButton');

        // Tüm görselleri gizle
        if (imgCompleted) imgCompleted.style.display = 'none';
        if (imgOnOrder) imgOnOrder.style.display = 'none';
        if (imgPayment) imgPayment.style.display = 'none';
        if (imgOrderPlaced) imgOrderPlaced.style.display = 'none';
        if (imgCanceled) imgCanceled.style.display = 'none';
        if (downloadLink) downloadLink.style.display = 'none';

        if (data.status === 'Completed') {
            if (imgCompleted) imgCompleted.style.display = 'block';
            statusDescription = 'Siparişiniz tamamlanmıştır. Bizimle çalıştığınız için teşekkür ederiz.';
            if (downloadLink) {
                downloadLink.style.display = 'block';
                downloadLink.href = data.projectLink || '#';
                downloadLink.onclick = (e) => {
                    e.preventDefault();
                    if (data.projectLink) {
                        const fullUrl = data.projectLink.startsWith('http://') || data.projectLink.startsWith('https://')
                            ? data.projectLink
                            : 'https://' + data.projectLink;
                        window.open(fullUrl, '_blank');
                    }
                };
            }
            setText('displayStatus', 'Tamamlandı');
            if (paymentButtonContainer) paymentButtonContainer.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'flex';
            if (backBtn) backBtn.style.display = 'flex';

        } else if (data.status === 'InProgress') {
            if (imgOnOrder) imgOnOrder.style.display = 'block';
            statusDescription = 'Siparişinizi en kısa sürede ve en kaliteli şekilde hazırlıyoruz.';
            setText('displayStatus', 'İşlemde');
            if (paymentButtonContainer) paymentButtonContainer.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'flex';
            if (backBtn) backBtn.style.display = 'flex';

        } else if (data.status === 'WaitingForApproval' || data.status === 'Pending') {
            // ✅ DÜZELTME: Eksik { eklendi, gereksiz ikinci WaitingForApproval bloğu kaldırıldı
            if (Number(data.totalAmount) > 0) {
                if (imgPayment) imgPayment.style.display = 'block';
                statusDescription = 'Sizinle Whatsapp üzerinden iletişime geçtik';
                setText('displayStatus', 'Ödeme Bekleniyor');
                if (paymentButtonContainer) paymentButtonContainer.style.display = 'flex';
                if (nextBtn) nextBtn.style.display = 'none';
                if (backBtn) backBtn.style.display = 'none';
                const priceText = document.querySelector('.priceText');
                if (priceText) {
                    priceText.innerText = `${formatTurkishNumber(Math.round(data.totalAmount))}TL`;
                }
            } else {
                // Fiyat henüz girilmemişse → Siparişi aldık, değerlendiriliyor
                if (imgOrderPlaced) imgOrderPlaced.style.display = 'block';
                statusDescription = 'Siparişinizi aldık sizinle en kısa sürede Whatsapp üzerinden iletişime geçeceğiz.';
                setText('displayStatus', 'Değerlendiriliyor');
                if (paymentButtonContainer) paymentButtonContainer.style.display = 'none';
                if (nextBtn) nextBtn.style.display = 'flex';
                if (backBtn) backBtn.style.display = 'flex';
                const priceText = document.querySelector('.priceText');
                if (priceText) {
                    priceText.innerText = '0TL';
                }
            }

        } else if (data.status === 'Cancelled') {
            if (imgCanceled) imgCanceled.style.display = 'block';
            statusDescription = 'Sipariş iptal edilmiştir. Bir yanlışlık olduğunu düşünüyorsanız \'Destek Al\' butonu ile bize ulaşabilirsiniz.';
            setText('displayStatus', 'İptal Edildi');
            if (paymentButtonContainer) paymentButtonContainer.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'flex';
            if (backBtn) backBtn.style.display = 'flex';
        }

        // Açıklamayı ayarla
        if (statusDescriptionEl) {
            statusDescriptionEl.innerText = statusDescription;
        }
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    }
});
