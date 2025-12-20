// verifications.js - DÜZELTİLMİŞ SÜRÜM

// API adresi config.js'den alınıyor
const API_BASE_URL = (typeof CONFIG !== 'undefined') ? CONFIG.API_BASE_URL : 'http://130.61.108.198:3000';

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTLER ---
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    const nextButton = document.getElementById('nextButton');
    const btnText = document.getElementById('btnText');
    const headerBackBtn = document.getElementById('backButton');

    // Adım 1 Elemanları
    const contactInput = document.getElementById('contactInput');
    const contactLabel = document.getElementById('contactLabel');
    const inputSwitcher = document.getElementById('inputSwitcher');
    const errorText = document.getElementById('errorText');

    // Adım 2 Elemanları
    const sentAddressText = document.getElementById('sentAddressText');
    const otpInputs = document.querySelectorAll('.otp-input');
    const otpError = document.getElementById('otpError');
    const timerElement = document.getElementById('countdown');
    const resendTimer = document.getElementById('resendTimer');
    const resendLink = document.getElementById('resendLink');

    // Adım 3 Elemanları
    const trackingCodeDisplay = document.getElementById('trackingCodeDisplay');
    const copyButton = document.getElementById('copyButton');

    let currentStep = 0;
    let isEmailMode = false;
    let foundClientId = null;
    let foundTrackingCode = null;

    // --- HATA GÖSTERME FONKSİYONLARI ---
    function showError(msg) {
        if (contactInput) contactInput.classList.add('input-error');
        if (errorText) {
            errorText.innerText = msg;
            errorText.style.display = 'block';
        }
    }

    function hideError() {
        if (contactInput) contactInput.classList.remove('input-error');
        if (errorText) errorText.style.display = 'none';
    }

    // --- OTP HATA FONKSİYONLARI ---
    function showOtpError(msg) {
        if (otpInputs) {
            otpInputs.forEach(i => i.classList.add('otp-error'));
        }
        if (otpError) {
            otpError.innerText = msg;
            otpError.style.display = 'block';
        }
    }

    function hideOtpError() {
        if (otpInputs) {
            otpInputs.forEach(i => i.classList.remove('otp-error'));
        }
        if (otpError) {
            otpError.style.display = 'none';
            otpError.innerText = '';
        }
    }

    // --- SAYFA GEÇİŞLERİ ---
    function showStep(stepIndex) {
        // Tüm adımları gizle
        if (step1) step1.style.display = 'none';
        if (step2) step2.style.display = 'none';
        if (step3) step3.style.display = 'none';

        if (stepIndex === 0) {
            // --- 1. ADIM ---
            if (step1) step1.style.display = 'block';
            if (btnText) btnText.innerText = "Devam Et";

            // Geri Tuşu -> orders-code.html sayfasına
            if (headerBackBtn) {
                headerBackBtn.onclick = (e) => {
                    e.preventDefault();
                    window.location.href = 'orders-code.html';
                };
                headerBackBtn.style.cursor = 'pointer';
            }

            if (nextButton) nextButton.style.display = 'flex';
        }
        else if (stepIndex === 1) {
            // --- 2. ADIM ---
            if (step2) step2.style.display = 'block';
            if (btnText) btnText.innerText = "Doğrula";

            // Geri Tuşu -> Bir önceki adıma
            if (headerBackBtn) headerBackBtn.onclick = (e) => {
                e.preventDefault();
                prevStep();
            };

            if (nextButton) nextButton.style.display = 'flex';
        }
        else if (stepIndex === 2) {
            // --- 3. ADIM (BAŞARILI) ---
            if (step3) step3.style.display = 'block';
            if (btnText) btnText.innerText = "Sipariş Sorgula";

            // Tracking code'u göster
            if (trackingCodeDisplay && foundTrackingCode) {
                trackingCodeDisplay.innerText = `Sipariş Kodu: #${foundTrackingCode}`;
            }

            // Geri Tuşu -> Bir önceki adıma (Kod girme ekranına döner)
            if (headerBackBtn) headerBackBtn.onclick = (e) => {
                e.preventDefault();
                prevStep();
            };

            if (nextButton) {
                nextButton.style.display = 'flex';
                nextButton.onclick = (e) => {
                    e.preventDefault();
                    // Tracking code'u URL parametresi olarak gönder
                    window.location.href = `orders-code.html?code=${foundTrackingCode}`;
                };
            }
        }
    }

    function prevStep() {
        if (currentStep > 0) {
            currentStep--;
            hideError();
            hideOtpError();
            otpInputs.forEach(i => i.value = '');
            otpInputs.forEach(i => i.classList.remove('filled'));
            if (window.otpTimer) clearInterval(window.otpTimer);
            showStep(currentStep);
        }
    }

    // --- GİRİŞ ALANI MANTIĞI ---
    if (inputSwitcher) {
        inputSwitcher.addEventListener('click', (e) => {
            e.preventDefault();
            isEmailMode = !isEmailMode;

            if (contactInput) contactInput.value = '';
            hideError();

            if (isEmailMode) {
                if (contactLabel) contactLabel.innerText = "E-Posta Adresi";
                if (contactInput) {
                    contactInput.placeholder = "E-Posta Adresiniz";
                    contactInput.type = "email";
                    contactInput.maxLength = 50;
                }
                if (inputSwitcher) inputSwitcher.innerText = "Telefon Numarası";
            } else {
                if (contactLabel) contactLabel.innerText = "Telefon Numarası";
                if (contactInput) {
                    contactInput.placeholder = "Telefon Numaranız";
                    contactInput.type = "tel";
                    contactInput.maxLength = 11;
                }
                if (inputSwitcher) inputSwitcher.innerText = "E-Posta Adresi";
            }
        });
    }

    if (contactInput) {
        contactInput.addEventListener('input', function () {
            hideError();
            if (!isEmailMode) {
                this.value = this.value.replace(/[^0-9]/g, '');
            }
        });
    }

    // --- BUTON TIKLAMA ---
    if (nextButton) {
        nextButton.addEventListener('click', async () => {

            // ADIM 1: KONTROL
            if (currentStep === 0) {
                const value = contactInput.value.trim();

                if (!value) {
                    showError(isEmailMode ? "Lütfen e-posta adresinizi giriniz." : "Lütfen telefon numaranızı giriniz.");
                    return;
                }

                if (isEmailMode) {
                    if (!value.includes('@') || !value.includes('.')) {
                        showError("Lütfen geçerli bir e-posta adresi giriniz.");
                        return;
                    }
                } else {
                    if (value.length < 10) {
                        showError("Lütfen geçerli bir telefon numarası giriniz.");
                        return;
                    }
                }

                nextButton.disabled = true;
                if (btnText) btnText.innerText = "Kontrol...";

                try {
                    const response = await fetch(`${API_BASE_URL}/projects/check-contact`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(isEmailMode ? { email: value } : { phone: value })
                    });

                    const data = await response.json();

                    if (data.found) {
                        foundClientId = data.clientId;
                        if (sentAddressText) sentAddressText.innerText = value;
                        startTimer();

                        currentStep = 1;
                        showStep(1);

                    } else {
                        const msg = isEmailMode
                            ? "Bu e-posta adresine ait bir sipariş bulunmamaktadır."
                            : "Bu telefon numarasına ait bir sipariş bulunmamaktadır.";
                        showError(msg);
                    }

                } catch (error) {
                    console.error(error);
                    // Hata durumunda popup yerine input altında gösteriyoruz
                    showError("Sunucu hatası. Lütfen bağlantınızı kontrol edin.");
                } finally {
                    nextButton.disabled = false;
                    if (currentStep === 0 && btnText) btnText.innerText = "Devam Et";
                }
            }

            // ADIM 2: KOD DOĞRULAMA
            else if (currentStep === 1) {
                const otpCode = Array.from(otpInputs).map(i => i.value).join('');

                if (otpCode.length < 6) {
                    showOtpError('Lütfen 6 haneli kodu tam olarak giriniz.');
                    return;
                }

                nextButton.disabled = true;
                if (btnText) btnText.innerText = "Doğrulanıyor...";

                try {
                    console.log('OTP Code being sent:', otpCode, 'Length:', otpCode.length);
                    console.log('Client ID:', foundClientId);
                    console.log('Is Email:', isEmailMode);

                    // Backend doğrulama
                    const response = await fetch(`${API_BASE_URL}/projects/verify-otp`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            clientId: foundClientId, 
                            otp: otpCode,
                            isEmail: isEmailMode 
                        })
                    });

                    console.log('Response Status:', response.status);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    console.log('Response Data:', data);

                    if (data.verified || data.success) {
                        foundTrackingCode = data.trackingCode;
                        hideOtpError();
                        currentStep = 2;
                        showStep(2);
                    } else {
                        showOtpError(data.message || 'Girdiğiniz kod yanlış. Lütfen tekrar deneyiniz.');
                    }
                } catch (error) {
                    console.error('OTP Verification Error:', error);
                    showOtpError('Doğrulama sırasında hata oluştu. Sunucu ile bağlantı kurulamadı.');
                } finally {
                    nextButton.disabled = false;
                    if (currentStep === 1 && btnText) btnText.innerText = "Doğrula";
                }
            }
        });
    }

    // --- OTP INPUTLARI ---
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            const val = e.target.value;
            if (isNaN(val)) { e.target.value = ''; return; }

            if (val) input.classList.add('filled');
            else input.classList.remove('filled');

            if (val.length === 1 && index < otpInputs.length - 1) {
                otpInputs[index + 1].focus();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });

        input.addEventListener('focus', () => {
            hideOtpError();
        });

        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').substring(0, 6);
            
            // Her karakteri ilgili input'a yerleştir
            for (let i = 0; i < pastedData.length && i < otpInputs.length; i++) {
                otpInputs[i].value = pastedData[i];
                otpInputs[i].classList.add('filled');
            }
            
            // Son input'a focus ver
            if (pastedData.length > 0) {
                const focusIndex = Math.min(pastedData.length, otpInputs.length - 1);
                otpInputs[focusIndex].focus();
            }
        });
    });

    // --- ZAMANLAYICI ---
    function startTimer() {
        let timeLeft = 90; // 1.5 dakika = 90 saniye (giriş süresi)
        if (resendTimer) resendTimer.style.display = 'block';
        if (resendLink) resendLink.style.display = 'none';
        
        // OTP inputlarını HER ZAMAN aktif et
        otpInputs.forEach(input => {
            input.disabled = false;
            input.style.opacity = '1';
            input.style.cursor = 'text';
        });
        nextButton.disabled = false;

        if (window.otpTimer) clearInterval(window.otpTimer);

        window.otpTimer = setInterval(() => {
            if (timeLeft <= 0) {
                clearInterval(window.otpTimer);
                if (timerElement) timerElement.innerText = "00:00";
                if (resendTimer) resendTimer.style.display = 'none';
                if (resendLink) resendLink.style.display = 'block';
                
                // OTP inputlarını devre dışı bırakma - aktif kal
                // Input'lar aktif kalacak, kullanıcı yeni kod isteyebilecek
            } else {
                const minutes = Math.floor(timeLeft / 60).toString().padStart(2, '0');
                const seconds = (timeLeft % 60).toString().padStart(2, '0');
                if (timerElement) timerElement.innerText = `${minutes}:${seconds}`;
                timeLeft--;
            }
        }, 1000);
    }

    if (resendLink) {
        resendLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            if (!foundClientId) {
                showOtpError('Müşteri bilgisi bulunamadı.');
                return;
            }

            resendLink.disabled = true;
            const originalText = resendLink.innerText;
            resendLink.innerText = 'Gönderiliyor...';

            try {
                // Backend'e kodu tekrar gönder
                const response = await fetch(`${API_BASE_URL}/projects/resend-otp`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        clientId: foundClientId,
                        isEmail: isEmailMode 
                    })
                });

                const data = await response.json();

                if (data.success || response.ok) {
                    // OTP input'larını temizle
                    otpInputs.forEach(input => {
                        input.value = '';
                        input.classList.remove('filled');
                    });
                    hideOtpError();
                    resendLink.style.display = 'none';
                    startTimer(); // Timer'ı yeniden başlat
                    console.log('Kod tekrar gönderildi');
                } else {
                    showOtpError(data.message || 'Kod gönderilemedi. Lütfen tekrar deneyin.');
                }
            } catch (error) {
                console.error('Resend OTP Error:', error);
                showOtpError('Kod gönderilemedi. Lütfen tekrar deneyin.');
            } finally {
                resendLink.disabled = false;
                resendLink.innerText = originalText;
            }
        });
    }

    // Copy Button Event Listener
    if (copyButton) {
        copyButton.addEventListener('click', (e) => {
            e.preventDefault();
            if (trackingCodeDisplay) {
                const codeText = foundTrackingCode;
                if (codeText) {
                    navigator.clipboard.writeText(codeText).then(() => {
                        const originalText = copyButton.innerText;
                        copyButton.innerText = "Kopyalandı!";
                        setTimeout(() => {
                            copyButton.innerText = originalText;
                        }, 2000);
                    }).catch(() => {
                        alert("Kod kopyalanamadı. Lütfen manuel olarak kopyalayınız.");
                    });
                }
            }
        });
    }

    // İlk Başlangıç
    showStep(0);
});

function copyCode() {
    const codeText = document.querySelector('[data-tracking-code]')?.innerText || 'Kod bulunamadı';
    navigator.clipboard.writeText(codeText).then(() => {
        alert("Kod kopyalandı!");
    }).catch(() => {
        alert("Kod kopyalanamadı. Lütfen manuel olarak kopyalayınız.");
    });
}