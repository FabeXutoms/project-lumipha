const headermenu = document.querySelector('.headermenu');
const sidebar = document.querySelector('.sidebar');
const menuicon = document.querySelector('.menuicon');
const closeicon = document.querySelector('.closeicon');
const headerlogo = document.querySelector('.headerlogo');
const headerSection = document.querySelector('.header');

const PATH = {
    LOGO_VARSAYILAN: 'imageswhite/Logo.svg',
    MENU_ACIK_VARSAYILAN: 'imageswhite/ri_menu-5-line.svg',
    
    LOGO_SIDEBAR: 'images/Logo.svg',
    CLOSE_SIDEBAR: 'images/close.svg',
};

headermenu.addEventListener('click', () => {
    sidebar.classList.toggle('opensidebar');
    
    const isOpen = sidebar.classList.contains('opensidebar');

    if (isOpen) {
        headerlogo.src = PATH.LOGO_SIDEBAR;
        
        menuicon.style.display = 'none';
        closeicon.style.display = 'block';
        closeicon.src = PATH.CLOSE_SIDEBAR; 
        
        headerSection.style.backgroundColor = '#f5f5f5';

    } else {
        headerlogo.src = PATH.LOGO_VARSAYILAN;
        
        menuicon.style.display = 'block';
        closeicon.style.display = 'none';
        menuicon.src = PATH.MENU_ACIK_VARSAYILAN;
        
        headerSection.style.backgroundColor = '#333333';
    }

    document.body.classList.toggle('noscroll', isOpen);
});

document.addEventListener('DOMContentLoaded', function() {

    const headers = document.querySelectorAll('.accordion-header');
    const contents = document.querySelectorAll('.accordion-content');

    headers.forEach(header => {
        header.addEventListener('click', () => {

            const item = header.closest('.accordion-item');
            const targetContent = item.querySelector('.accordion-content');
            
            if (targetContent.classList.contains('active')) {
                targetContent.classList.remove('active');
                header.classList.remove('active');
                return; 
            }

            contents.forEach(content => {
                content.classList.remove('active');
            });

            headers.forEach(h => {
                h.classList.remove('active');
            });

            targetContent.classList.add('active');
            header.classList.add('active');
        });
    });
});

