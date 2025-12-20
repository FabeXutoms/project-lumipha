document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Elementleri ORTAK ID'lerine göre seçiyoruz
    const kopyalaBtn = document.getElementById('kopyalaBtn');
    const hedefMetin = document.getElementById('kopyalanacakMetin'); // Hem tel hem mail için ortak ID
    const mesajKutusu = document.getElementById('kopyalandiMesaji');

    // Hata önleyici: Eğer bu elemanlar bu sayfada yoksa (örn. anasayfa) kod çalışmayı durdurur.
    if (!kopyalaBtn || !hedefMetin || !mesajKutusu) return;

    // 2. Tıklama olayı
    kopyalaBtn.addEventListener('click', () => {
        
        // Hedef elementin içindeki yazıyı al (Mail sayfasında maili, Tel sayfasında teli alır)
        const metin = hedefMetin.innerText;

        // 3. Panoya kopyala
        navigator.clipboard.writeText(metin)
            .then(() => {
                // --- BAŞARILI ---
                
                // Mesajı göster (Animasyon başlat)
                mesajKutusu.classList.add('aktif');

                // 2 saniye sonra gizle
                setTimeout(() => {
                    mesajKutusu.classList.remove('aktif');
                }, 2000);
            })
            .catch(err => {
                // --- HATA ---
                console.error('Kopyalama hatası:', err);
            });
    });
});