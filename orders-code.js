document.addEventListener('DOMContentLoaded', () => {
    // Elementleri seçelim
    const section1 = document.querySelector('.orders-content');
    const section2 = document.querySelector('.orders-content-second');
    const nextBtn = document.getElementById('nextButton');
    const backBtn = document.getElementById('backButton');
    const buttonContainer = document.getElementById('buttonContainer');
    
    // Yazıyı değiştireceğimiz elementi seçiyoruz
    const nextBtnTitle = document.querySelector('.nextbuttontitle'); // <-- Yeni eklenen

    // Başlangıç Ayarı
    section1.style.display = 'block';
    section2.style.display = 'none';

    // İLERLE Butonuna Tıklama Olayı
    nextBtn.addEventListener('click', () => {
        if (!buttonContainer.classList.contains('step-two-active')) {
            
            // 1. İçeriği Kaybet
            section1.style.opacity = '0';
            
            setTimeout(() => {
                section1.style.display = 'none';
                
                // 2. İçeriği Getir
                section2.style.display = 'block';
                setTimeout(() => {
                    section2.style.opacity = '1';
                }, 50);
            }, 300);

            // Butonların Yapısını Değiştir
            buttonContainer.classList.add('step-two-active');

            // Yazıyı "Destek Al" olarak değiştir
            nextBtnTitle.textContent = "Destek Al"; // <-- Burası değişti
        } else {
            // "Destek Al" butonuna basınca ne olacağını buraya yazabilirsin
            console.log("Destek Al tıklandı!");
        }
    });

    // GERİ DÖN Butonuna Tıklama Olayı
    backBtn.addEventListener('click', () => {
        // 2. İçeriği Kaybet
        section2.style.opacity = '0';

        setTimeout(() => {
            section2.style.display = 'none';

            // 1. İçeriği Getir
            section1.style.display = 'block';
            setTimeout(() => {
                section1.style.opacity = '1';
            }, 50);
        }, 300);

        // Butonları Eski Haline Getir
        buttonContainer.classList.remove('step-two-active');

        // Yazıyı tekrar "İlerle" yap
        nextBtnTitle.textContent = "İlerle"; // <-- Burası değişti
    });
});