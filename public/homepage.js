const headermenu = document.querySelector('.headermenu');
const sidebar = document.querySelector('.sidebar');
const menuicon = document.querySelector('.menuicon');
const closeicon = document.querySelector('.closeicon');

let scrollPosition = 0;

headermenu.addEventListener('click', () => {
    sidebar.classList.toggle('opensidebar');
    const isOpen = sidebar.classList.contains('opensidebar');
    menuicon.style.display = isOpen ? 'none' : 'block';
    closeicon.style.display = isOpen ? 'block' : 'none';

    if (isOpen) {
        scrollPosition = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = -scrollPosition + 'px';
        document.body.style.width = '100%';
    } else {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollPosition);
    }
});



