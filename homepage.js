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

