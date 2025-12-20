// API adresi config.js'den alınıyor
const API_BASE_URL = (typeof CONFIG !== 'undefined') ? CONFIG.API_BASE_URL : 'http://130.61.108.198:3000';

// Validasyon fonksiyonları
const validateFullName = (fullName) => {
    if (!fullName.trim()) {
        return 'Ad ve soyad boş bırakılamaz.';
    }
    // Ad ve soyad boşluk ile ayrılmış mı ve en az 2 kelime mi?
    const parts = fullName.trim().split(/\s+/);
    if (parts.length < 2) {
        return 'Ad ve soyad boşluk ile ayrılmış olmalıdır. (Örn: Ali Yıldız)';
    }
    // Sadece harf ve boşluk mu?
    if (!/^[a-zA-ZçÇğĞıİöÖşŞüÜ\s]+$/.test(fullName)) {
        return 'Ad ve soyad sadece harflerden oluşmalıdır.';
    }
    return null; // Geçerli
};

const validateEmail = (email) => {
    if (!email.trim()) {
        return 'Email adresi boş bırakılamaz.';
    }
    // Email @ ve . içermeli mi?
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Geçerli bir email adresi giriniz. (@ ve . işaretleri içermelidir)';
    }
    return null; // Geçerli
};

const validatePhone = (phone) => {
    if (!phone.trim()) {
        return 'Telefon numarası boş bırakılamaz.';
    }
    // Sadece sayı mı?
    if (!/^\d+$/.test(phone)) {
        return 'Telefon numarası sadece sayılardan oluşmalıdır. (Harf girilemez)';
    }
    // Tam 11 karakter mı?
    if (phone.length !== 11) {
        return 'Telefon numarası tam olarak 11 rakamdan oluşmalıdır.';
    }
    return null; // Geçerli
};

const validateMessage = (message) => {
    if (!message.trim()) {
        return 'Mesaj boş bırakılamaz.';
    }
    // Minimum 25 karakter mi?
    if (message.trim().length < 25) {
        return `Mesaj en az 25 karakterden uzun olmalıdır. (Şu an: ${message.trim().length} karakter)`;
    }
    return null; // Geçerli
};

// Sidebar menü
const headermenu = document.querySelector('.headermenu');
const sidebar = document.querySelector('.sidebar');
const menuicon = document.querySelector('.menuicon');
const closeicon = document.querySelector('.closeicon');

headermenu.addEventListener('click', () => {
    sidebar.classList.toggle('opensidebar');
    const isOpen = sidebar.classList.contains('opensidebar');
    menuicon.style.display = isOpen ? 'none' : 'block';
    closeicon.style.display = isOpen ? 'block' : 'none';
    document.body.classList.toggle('noscroll', isOpen);
});

// İletişim Formu
const contactForm = document.getElementById('contactForm');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const messageInput = document.getElementById('message');
const kvkkCheckbox = document.getElementById('kvkkOnay');
const submitBtn = document.getElementById('submitBtn');
const formSentContainer = document.getElementById('formSentContainer');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Tüm validasyonları yap
        const fullNameError = validateFullName(fullNameInput.value);
        const emailError = validateEmail(emailInput.value);
        const phoneError = validatePhone(phoneInput.value);
        const messageError = validateMessage(messageInput.value);

        // Hata varsa göster
        if (fullNameError) {
            alert(fullNameError);
            fullNameInput.focus();
            return;
        }

        if (emailError) {
            alert(emailError);
            emailInput.focus();
            return;
        }

        if (phoneError) {
            alert(phoneError);
            phoneInput.focus();
            return;
        }

        if (messageError) {
            alert(messageError);
            messageInput.focus();
            return;
        }

        if (!kvkkCheckbox.checked) {
            alert('Lütfen KVKK onayını vermelisiniz.');
            return;
        }

        // Buton devre dışı bırak
        submitBtn.disabled = true;
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Gönderiliyor...';

        try {
            // API'ye gönder
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName: fullNameInput.value.trim(),
                    email: emailInput.value.trim(),
                    phone: phoneInput.value.trim(),
                    message: messageInput.value.trim(),
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Formu temizle
                contactForm.reset();

                // Başarı mesajını göster
                formSentContainer.style.display = 'flex';

                // 3 saniye sonra gizle
                setTimeout(() => {
                    formSentContainer.style.display = 'none';
                }, 3000);
            } else {
                // Backend'den gelen hata mesajını göster
                alert('Hata: ' + (data.message || 'Mesaj gönderilemedi.'));
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Hata: Mesaj gönderilemedi. Lütfen tekrar deneyin.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}