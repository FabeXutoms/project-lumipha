document.addEventListener('DOMContentLoaded', () => {
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

    const showModal = (modalElement) => {
        modalElement.style.display = 'block';
    };

    const hideModal = (modalElement) => {
        modalElement.style.display = 'none';
    };

    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    }

    siparisSilBtn.addEventListener('click', () => {
        showModal(silOnayModal);
    });

    silModalEvet.addEventListener('click', () => {
        hideModal(silOnayModal);
        alert('Sipariş başarıyla silindi!');
    });

    silModalHayir.addEventListener('click', () => {
        hideModal(silOnayModal);
    });

    fiyatBelirleOnaylaBtn.addEventListener('click', () => {
        showModal(fiyatModal);
    });

    fiyatOnaylaButonu.addEventListener('click', () => {
        const fiyat = fiyatInput.value;
        if (fiyat === "" || isNaN(fiyat) || parseFloat(fiyat) < 0) {
            alert("Lütfen geçerli bir fiyat girin.");
            return;
        }
        
        hideModal(fiyatModal);
        showModal(islemOnayModal);
    });
    
    islemModalEvet.addEventListener('click', () => {
        hideModal(islemOnayModal);
        const belirlenenFiyat = fiyatInput.value;
        alert(`İşlem Onaylandı! Belirlenen Fiyat: ${belirlenenFiyat} TL`);
    });

    islemModalHayir.addEventListener('click', () => {
        hideModal(islemOnayModal);
        showModal(fiyatModal);
    });
    
    readyButonu.addEventListener('click', () => {
        hideModal(onayModal);
        alert('Sipariş durumu "Hazırlanıyor" olarak güncellendi.');
    });

    completedButonu.addEventListener('click', () => {
        hideModal(onayModal);
        alert('Sipariş durumu "Tamamlandı" olarak güncellendi.');
    });

});