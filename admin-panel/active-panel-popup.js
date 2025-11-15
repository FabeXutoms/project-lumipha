var modalOnay = document.getElementById("onayModal");
var btnAc = document.getElementById("durum-update-button"); 
var btnready = document.getElementById("readyButonu");
var btncompleted = document.getElementById("completedButonu");
var modalInput = document.getElementById("input-modal"); 
var linkAc = document.getElementById("durum-link-button"); 
var inputLink = document.getElementById("linkInput");
var modalSon = document.getElementById("sonModal");
var actionButtons = document.querySelectorAll(".action-button");
var btnSonEvet = document.getElementById("sonModalEvet");
var btnSonHayir = document.getElementById("sonModalHayir");

function modalKapat() {
  if (modalOnay) {
      modalOnay.style.display = "none";
  }
  if (modalInput) {
      modalInput.style.display = "none";
  }
  if (modalSon) {
      modalSon.style.display = "none";
  }
}

if (modalOnay && btnAc && btnready && btncompleted) {
    btnAc.onclick = function(e) {
      e.preventDefault();
      modalKapat(); 
      modalOnay.style.display = "block";
    }

    btnready.onclick = modalKapat;
    btncompleted.onclick = modalKapat; 
}

if (modalInput && linkAc && inputLink) {
    linkAc.onclick = function(e) {
      e.preventDefault();
      modalKapat(); 
      modalInput.style.display = "block";
      inputLink.value = ''; 
      inputLink.focus(); 
    }
    
    inputLink.addEventListener('keypress', function(event) {
        if (event.key === 'Enter' || event.keyCode === 13) {
            if (inputLink.value.trim().length > 0) {
                event.preventDefault(); 
                modalKapat();
                alert("Link başarıyla kaydedildi!"); 
            }
        }
    });
}

if (modalSon && actionButtons.length > 0) {
    
    actionButtons.forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            modalKapat();
            modalSon.style.display = "block";
            
            var islemTuru = button.textContent.trim();
            modalSon.querySelector('h3').textContent = islemTuru + " işlemini onaylıyor musunuz?";
        });
    });


    if (btnSonEvet && btnSonHayir) {
        btnSonHayir.onclick = modalKapat;
        
        btnSonEvet.onclick = function() {
            modalKapat();
            alert("İşlem onaylandı!");
        }
    }
}

window.onclick = function(event) {
    if (event.target == modalOnay || event.target == modalInput || event.target == modalSon) {
      modalKapat();
    }
}