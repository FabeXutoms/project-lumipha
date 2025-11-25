// offer.js - İKON EFEKTLİ VE BACKEND ENTEGRELİ SÜRÜM

let currentStep = 1;
const totalSteps = 6; // 7 Sayfa (1-7)
const API_BASE_URL = 'http://localhost:3000';

// --- SAYFA YÜKLENDİĞİNDE ---
document.addEventListener("DOMContentLoaded", function () {
    showTab(currentStep);

    // Telefon Numarası Rakam Kontrolü
    const phoneInput = document.getElementById('clientPhone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            this.value = this.value.replace(/[^0-9]/g, '');
        });
    }

    // Radyo Buton Seçimi (Arkadaşının kodu entegre edildi)
    const allContainers = document.querySelectorAll('.rb-buttons-alignment-styles');
    allContainers.forEach(container => {
        container.addEventListener('click', function (e) {
            if (e.target.tagName !== 'INPUT') {
                const radio = container.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                    updateRadioStyles();
                }
            } else {
                updateRadioStyles();
            }
        });
    });

    // Hizmet Seçimi Başlat (Arkadaşının fonksiyonu)
    handleServiceSelection();
});

function updateRadioStyles() {
    const allContainers = document.querySelectorAll('.rb-buttons-alignment-styles');
    allContainers.forEach(container => {
        const radio = container.querySelector('input[type="radio"]');
        container.classList.remove('rb-active');
        if (radio && radio.checked) {
            container.classList.add('rb-active');
        }
    });
}

// --- SAYFA GÖSTERME ---
function showTab(n) {
    const tabs = document.querySelectorAll('.formtab');
    tabs.forEach(tab => tab.style.display = 'none');

    const activeTab = document.getElementById(`stepContent${n}`);
    if (activeTab) activeTab.style.display = 'block';

    const formSteps = document.querySelector('.formsteps');
    if (n <= 5) {
        if (formSteps) formSteps.style.display = 'flex';
        updateVisualSteps(n);
    } else {
        if (formSteps) formSteps.style.display = 'none';
    }

    // Buton Yönetimi
    const backBtn = document.getElementById('backButton');
    const nextBtn = document.getElementById('nextButton');
    const btnContainer = document.getElementById('buttonContainer');
    const nextBtnTitle = document.getElementById('nextBtnText');

    if (n === 1) {
        backBtn.style.display = 'none';
        nextBtn.style.display = 'flex';
        btnContainer.classList.remove('adim-2');
        nextBtnTitle.innerText = "İlerle";
    }
    else if (n === 7) {
        backBtn.style.display = 'flex';
        nextBtn.style.display = 'none';
        btnContainer.classList.remove('adim-2');
        backBtn.style.width = '86%';
        backBtn.style.justifyContent = 'center';
        backBtn.querySelector('.backbuttontitle').innerText = 'Kapat';
        backBtn.onclick = function () { window.location.href = 'homepage.html'; };
    }
    else {
        backBtn.style.display = 'flex';
        nextBtn.style.display = 'flex';
        btnContainer.classList.add('adim-2');
        if (n === 6) nextBtnTitle.innerText = "Talep Oluştur";
        else nextBtnTitle.innerText = "İlerle";
        backBtn.style.width = '';
        backBtn.querySelector('.backbuttontitle').innerText = 'Geri Dön';
        backBtn.onclick = prevStep;
    }

    if (n === 6) fillSummary();
}

function updateVisualSteps(n) {
    const stepMapping = [null, { majorIndex: 0, rectIndex: 0 }, { majorIndex: 0, rectIndex: 1 }, { majorIndex: 1, rectIndex: 0 }, { majorIndex: 2, rectIndex: 0 }, { majorIndex: 2, rectIndex: 1 }];
    const currentMap = stepMapping[n];
    if (!currentMap) return;
    const allStepDivs = [document.getElementById('step1'), document.getElementById('step2'), document.getElementById('step3')];
    const bgEffect = document.querySelector('.bgeffect');

    allStepDivs.forEach((stepDiv, index) => {
        if (!stepDiv) return;
        stepDiv.classList.remove('active');
        stepDiv.querySelectorAll('.formsteprectangle').forEach(r => r.classList.remove('fsr-active'));
        if (index === currentMap.majorIndex) {
            stepDiv.classList.add('active');
            if (bgEffect) {
                const left = stepDiv.offsetLeft;
                bgEffect.style.left = `${left}px`;
            }
            const rectangles = stepDiv.querySelectorAll('.formsteprectangle');
            if (rectangles[currentMap.rectIndex]) {
                rectangles[currentMap.rectIndex].classList.add('fsr-active');
            }
        }
    });
}

// --- BUTON FONKSİYONLARI ---
async function nextStep() {
    if (!validateStep(currentStep)) return;
    if (currentStep < 6) {
        currentStep++;
        showTab(currentStep);
    } else {
        await submitForm();
    }
}

function prevStep() {
    if (currentStep === 7) { window.location.href = 'homepage.html'; return; }
    if (currentStep > 1) {
        currentStep--;
        showTab(currentStep);
    }
}

// --- HİZMET SEÇİMİ (ARKADAŞININ KODU ENTEGRE EDİLDİ) ---
function handleServiceSelection() {
    const serviceCards = document.querySelectorAll('.pcontainer');
    const SELECTED_ICON_SRC = 'images/iconOffersSelected.svg';
    const DEFAULT_ICON_SRC = 'images/offericonbase.svg';

    serviceCards.forEach(card => {
        // Başlangıç durumu kontrolü
        const checkInitialState = function () {
            const iconElement = card.querySelector('.offercontainericon');
            if (!iconElement) return;
            if (card.classList.contains('pcontainer-active')) {
                iconElement.src = SELECTED_ICON_SRC;
            } else {
                iconElement.src = DEFAULT_ICON_SRC;
            }
        };
        checkInitialState();

        // Tıklama olayı
        card.addEventListener('click', function (event) {
            event.preventDefault();

            // Toggle (Seç / Kaldır)
            const isActive = this.classList.toggle('pcontainer-active');
            const iconElement = this.querySelector('.offercontainericon');

            if (iconElement) {
                if (isActive) {
                    iconElement.src = SELECTED_ICON_SRC;
                } else {
                    iconElement.src = DEFAULT_ICON_SRC;
                }
            }
        });
    });
}
// HTML'deki onclick="selectService(this)" çağrıları artık handleServiceSelection içindeki eventListener ile çakışabilir.
// Bu yüzden HTML'deki onclick'leri kaldırman veya bu fonksiyonu kullanman gerekebilir.
// Ama senin HTML'inde onclick="selectService(this)" var. Bu yüzden aşağıya boş bir fonksiyon ekleyip, 
// işi tamamen handleServiceSelection'a bırakabiliriz veya HTML'den onclick'i silebilirsin.
// En güvenli yol: HTML'deki onclick kalsın, ama içi boş olsun, işi yukarıdaki eventListener yapsın.
function selectService(element) {
    // Bu fonksiyon HTML'deki onclick çağrısını karşılar ama işlem yapmaz.
    // İşlem, handleServiceSelection içindeki addEventListener ile yapılır.
}


// --- DOĞRULAMA ---
function validateStep(step) {
    if (step === 1) {
        const val = document.getElementById('companyName').value.trim();
        if (!val) { alert("Lütfen işletme adını giriniz."); return false; }
    }
    else if (step === 2) {
        const scale = document.querySelector('input[name="business-scale"]:checked');
        const type = document.getElementById('businessType').value.trim();
        if (!scale) { alert("Lütfen işletme ölçeğini seçiniz."); return false; }
        if (!type) { alert("Lütfen işletme türünü giriniz."); return false; }
    }
    else if (step === 3) {
        const selected = document.querySelectorAll('.pcontainer.pcontainer-active');
        if (selected.length === 0) { alert("Lütfen en az bir hizmet seçiniz."); return false; }
    }
    else if (step === 4) {
        const val = document.getElementById('clientName').value.trim();
        if (!val) { alert("Lütfen adınızı giriniz."); return false; }
        if (!val.includes(' ')) { alert("Lütfen Ad ve Soyad arasına boşluk bırakarak tam adınızı giriniz."); return false; }
    }
    else if (step === 5) {
        const phone = document.getElementById('clientPhone').value.trim();
        const email = document.getElementById('clientEmail').value.trim();
        if (!phone) { alert("Lütfen telefon numaranızı giriniz."); return false; }
        if (email && !email.includes('@')) { alert("Geçerli bir e-posta giriniz (@ işareti olmalı)."); return false; }
    }
    return true;
}

// --- ÖZETİ DOLDUR ---
function fillSummary() {
    document.getElementById('summaryCompany').innerText = document.getElementById('companyName').value;
    document.getElementById('summaryName').innerText = document.getElementById('clientName').value;
    document.getElementById('summaryPhone').innerText = document.getElementById('clientPhone').value;
    document.getElementById('summaryEmail').innerText = document.getElementById('clientEmail').value || '-';

    const selectedServices = Array.from(document.querySelectorAll('.pcontainer.pcontainer-active'))
        .map(el => el.querySelector('.containerptext').innerText)
        .join(', ');
    document.getElementById('summaryServices').innerText = selectedServices || 'Seçim Yok';
}

// --- BACKEND GÖNDERİMİ ---
async function submitForm() {
    const nextBtn = document.getElementById('nextButton');
    const btnText = document.getElementById('nextBtnText');

    nextBtn.disabled = true;
    btnText.innerText = 'Gönderiliyor...';

    const selectedServices = Array.from(document.querySelectorAll('.pcontainer.pcontainer-active'))
        .map(el => el.querySelector('.containerptext').innerText)
        .join(', ');

    const scaleInput = document.querySelector('input[name="business-scale"]:checked');
    const scale = scaleInput ? scaleInput.value : '';

    const formData = {
        companyName: document.getElementById('companyName').value.trim(),
        businessScale: scale,
        businessType: document.getElementById('businessType').value.trim(),
        packageName: selectedServices,
        clientName: document.getElementById('clientName').value.trim(),
        clientPhone: document.getElementById('clientPhone').value.trim(),
        clientEmail: document.getElementById('clientEmail').value.trim() || 'no-email@provided.com',
        totalAmount: 0
    };

    try {
        const response = await fetch(`${API_BASE_URL}/projects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': 'AjansBackendCokGizliAnahtarimiz2025!'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('finalTrackingCode').innerText = data.trackingCode;
            currentStep = 7;
            showTab(7);
        } else {
            if (response.status === 409 || response.status === 400) {
                alert("UYARI: Bu E-Posta veya Telefon numarası zaten sistemde kayıtlı! Lütfen farklı bilgiler kullanın.");
            } else {
                alert("Hata: " + (data.message || "Bir sorun oluştu."));
            }
            nextBtn.disabled = false;
            btnText.innerText = 'Talep Oluştur';
        }
    } catch (error) {
        console.error("Hata:", error);
        alert("Sunucuya bağlanılamadı. Backend çalışıyor mu?");
        nextBtn.disabled = false;
        btnText.innerText = 'Talep Oluştur';
    }
}

function copyCode() {
    const code = document.getElementById('finalTrackingCode').innerText;
    navigator.clipboard.writeText(code).then(() => alert("Kod kopyalandı!"));
}
