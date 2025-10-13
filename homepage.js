const headermenu = document.querySelector('.headermenu');
const sidebar = document.querySelector('.sidebar');
const menuicon = document.querySelector('.menuicon');
const closeicon = document.querySelector('.closeicon');

headermenu.addEventListener('click', () => {
    sidebar.classList.toggle('opensidebar');
    
    menuicon.style.display = sidebar.classList.contains('opensidebar') ? 'none' : 'block';
    closeicon.style.display = sidebar.classList.contains('opensidebar') ? 'block' : 'none';

    document.body.classList.toggle('noscroll', sidebar.classList.contains('opensidebar'));
});

const surecSection = document.querySelector('.partsurec');
const popup = document.querySelector('#popup');
const closePopupBtn = document.querySelector('#closePopup');

let popupShown = false;

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !popupShown) {
      popup.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      popupShown = true;
    }
  });
}, { threshold: 0.6 });

observer.observe(surecSection);

closePopupBtn.addEventListener('click', () => {
  popup.classList.add('hidden');
  document.body.style.overflow = '';
});