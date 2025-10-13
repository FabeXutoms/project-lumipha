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


