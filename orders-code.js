// orders-code.js - FİNAL VE DİNAMİK SÜRÜM

const API_BASE_URL = 'http://localhost:3000';

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
            const response = await fetch(`${API_BASE_URL}/tracking/${trackingCode}`);

            if (!response.ok) {
                throw new Error("Sipariş bulunamadı");
            }

            const data = await response.json();
            console.log('API\'den gelen data:', data);

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

        currentTrackingCode = null;

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
    });

    // --- VERİ DOLDURMA ---
    function populateOrderData(data) {
        console.log('populateOrderData çağrıldı, status:', data.status, 'totalAmount:', data.totalAmount);
        // Şirket adı varsa onu, yoksa müşteri adını, o da yoksa "Müşteri" yaz
        const ownerName = data.companyName || data.clientName || "Müşteri";

        setText('displayOwnerName', ownerName);
        setText('displayServiceName', data.packageName);

        setText('contactName', data.clientName);
        // Telefon ve Mail verisini backend'den alıp yazıyoruz
        setText('contactPhone', data.clientPhone || '-');
        setText('contactEmail', data.clientEmail || '-');

        // Download Butonunu Kontrol Et
        const downloadLink = document.querySelector('.downloadlink');

        // Durum Açıklaması
        const statusDescriptionEl = document.getElementById('statusDescription');
        let statusDescription = '';

        // Durum Görselleri ve Açıklamalar
        const imgCompleted = document.getElementById('imgCompleted');
        const imgOnOrder = document.getElementById('imgOnOrder');
        const imgPayment = document.getElementById('imgPayment');
        const imgOrderPlaced = document.getElementById('imgOrderPlaced');
        const imgCanceled = document.getElementById('imgCanceled');

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
                downloadLink.style.display = 'block'; // Download linki göster
                downloadLink.href = data.projectLink || '#';
                console.log('projectLink:', data.projectLink);
                downloadLink.onclick = (e) => {
                    e.preventDefault();
                    console.log('Link tıklandı, açılıyor:', data.projectLink);
                    if (data.projectLink) {
                        // Eğer protokol yoksa https:// ekle
                        const fullUrl = data.projectLink.startsWith('http://') || data.projectLink.startsWith('https://') 
                            ? data.projectLink 
                            : 'https://' + data.projectLink;
                        window.open(fullUrl, '_blank');
                    }
                };
            }
            setText('displayStatus', 'Tamamlandı');
        }
        else if (data.status === 'InProgress') {
            if (imgOnOrder) imgOnOrder.style.display = 'block';
            statusDescription = 'Siparişinizi en kısa sürede ve en kaliteli şekilde hazırlıyoruz.';
            setText('displayStatus', 'İşlemde');
        }
        else if (data.status === 'Pending') {
            if (Number(data.totalAmount) > 0) {
                if (imgPayment) imgPayment.style.display = 'block';
                statusDescription = 'Sizinle Whatsapp üzerinden iletişime geçtik';
                setText('displayStatus', 'Ödeme Bekleniyor');
            } else {
                // Fiyat henüz girilmemişse (Onay aşaması), işlemde gibi görünsün
                if (imgOnOrder) imgOnOrder.style.display = 'block';
                statusDescription = 'Siparişinizi en kısa sürede ve en kaliteli şekilde hazırlıyoruz.';
                setText('displayStatus', 'Değerlendiriliyor');
            }
        }
        else if (data.status === 'WaitingForApproval') {
            if (imgOrderPlaced) imgOrderPlaced.style.display = 'block';
            statusDescription = 'Siparişinizi aldık sizinle en kısa sürede Whatsapp üzerinden iletişime geçeceğiz.';
            setText('displayStatus', 'Onay Bekleniyor');
        }
        else if (data.status === 'Cancelled') {
            if (imgCanceled) imgCanceled.style.display = 'block';
            statusDescription = 'Sipariş iptal edilmiştir. Bir yanlışlık olduğunu düşünüyorsanız \'Destek Al\' butonu ile bize ulaşabilirsiniz.';
            setText('displayStatus', 'İptal Edildi');
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
