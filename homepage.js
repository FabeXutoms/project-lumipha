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


const surecSection = document.querySelector('.partsurec');
const popup = document.querySelector('#popup');
const closePopupBtn = document.querySelector('#closePopup');

let popupShown = false;

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !popupShown) {
      popup.classList.remove('hidden');
      document.body.classList.add('noscroll');
      popupShown = true;
    }
  });
}, { threshold: 0.6 });

observer.observe(surecSection);

closePopupBtn.addEventListener('click', () => {
  popup.classList.add('hidden');
  document.body.classList.remove('noscroll');
});