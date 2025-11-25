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
    });

    // --- VERİ DOLDURMA ---
    function populateOrderData(data) {
        // Şirket adı varsa onu, yoksa müşteri adını, o da yoksa "Müşteri" yaz
        const ownerName = data.companyName || data.clientName || "Müşteri";

        setText('displayOwnerName', ownerName);
        setText('displayServiceName', data.packageName);

        setText('contactName', data.clientName);
        // Telefon ve Mail verisini backend'den alıp yazıyoruz
        setText('contactPhone', data.clientPhone || '-');
        setText('contactEmail', data.clientEmail || '-');

        // Durum Görselleri
        const imgCompleted = document.getElementById('imgCompleted');
        const imgOnOrder = document.getElementById('imgOnOrder');
        const imgPayment = document.getElementById('imgPayment');

        if (imgCompleted) imgCompleted.style.display = 'none';
        if (imgOnOrder) imgOnOrder.style.display = 'none';
        if (imgPayment) imgPayment.style.display = 'none';

        if (data.status === 'Completed') {
            if (imgCompleted) imgCompleted.style.display = 'block';
        }
        else if (data.status === 'InProgress') {
            if (imgOnOrder) imgOnOrder.style.display = 'block';
        }
        else if (data.status === 'Pending') {
            if (Number(data.totalAmount) > 0) {
                if (imgPayment) imgPayment.style.display = 'block';
            } else {
                // Fiyat henüz girilmemişse (Onay aşaması), işlemde gibi görünsün
                if (imgOnOrder) imgOnOrder.style.display = 'block';
            }
        }
        else if (data.status === 'WaitingForApproval') {
             if (imgOnOrder) imgOnOrder.style.display = 'block';
        }
    }

    function setText(id, text) {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    }
});