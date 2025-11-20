document.addEventListener("DOMContentLoaded", function() {

  // --- MODAL 1: Geri Al ---
  const openModalBtns = document.querySelectorAll(".takeitback");
  const modal = document.getElementById("geriAlModal"); // Bu 'geriAlModal'

  openModalBtns.forEach(function(btn) {
    btn.addEventListener("click", function(event) {
      event.preventDefault(); 
      modal.style.display = "block";
    });
  });

  const geriAlBtn = document.getElementById("geriAlButon");
  const iptalEtBtn = document.getElementById("iptalEtButon");

  function closeModal() {
    modal.style.display = "none";
  }

  geriAlBtn.addEventListener("click", function() {
    console.log("Sipariş 'Hazırlanıyor' durumuna alındı.");
    closeModal();
  });

  iptalEtBtn.addEventListener("click", function() {
    console.log("İptal edildi.");
    closeModal();
  });


  // --- MODAL 2: Link Değiştir ---
  const openLinkModalBtn = document.getElementById("linkDegistir");
  const linkModal = document.getElementById("input-modal"); // Bu 'input-modal'
  const linkInput = document.getElementById("linkInput"); // Input'u burada seçelim

  // "Link Değiştir" butonuna tıklanınca modalı aç
  openLinkModalBtn.addEventListener("click", function() {
    linkModal.style.display = "block";
    // Bonus: Modal açılınca input'a otomatik odaklansın
    linkInput.focus(); 
  });
  
  // Input'tayken "Enter" tuşuna basılırsa
  linkInput.addEventListener("keyup", function(event) {
    if (event.key === "Enter") {
      console.log("Girilen Link:", linkInput.value); // Linki al
      linkModal.style.display = "none"; // Modalı kapat
    }
  });


  // --- GENEL KAPATMA (Dışarı Tıklama) ---
  // İki modalı da kontrol eder
  window.addEventListener("click", function(event) {
    
    if (event.target == modal) {
      closeModal();
    }
    
    if (event.target == linkModal) {
      linkModal.style.display = "none";
    }
  });

});