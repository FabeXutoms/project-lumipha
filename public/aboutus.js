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

    // sınıf bazlı kontrol (inline style kaldırıldı)
    headerSection.classList.toggle('sidebar-open', isOpen);
    headerSection.classList.remove('homepage-style'); // sidebar açıldığında transparan moddan çık

    if (isOpen) {
        headerlogo.src = PATH.LOGO_SIDEBAR;
        
        menuicon.style.display = 'none';
        closeicon.style.display = 'block';
        closeicon.src = PATH.CLOSE_SIDEBAR; 
        
    } else {
        headerlogo.src = PATH.LOGO_VARSAYILAN;
        
        menuicon.style.display = 'block';
        closeicon.style.display = 'none';
        menuicon.src = PATH.MENU_ACIK_VARSAYILAN;
    }

    document.body.classList.toggle('noscroll', isOpen);
});

// yeni: about-hero tamamen ekrandan çıktığında header'ı homepage-style yap
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

    // scroll listener
    const aboutHero = document.querySelector('.about-hero');
    if (aboutHero) {
        const checkHero = () => {
            // eğer sidebar açıksa scroll modunu değiştirme
            if (sidebar.classList.contains('opensidebar')) return;

            const rect = aboutHero.getBoundingClientRect();
            const fullyOut = rect.bottom <= 0; // hero tamamen yukarı gitti mi

            if (fullyOut) {
                headerSection.classList.add('homepage-style');
                // logo renkli, menu ikonu beyaz
                headerlogo.src = PATH.LOGO_SIDEBAR;
                menuicon.src = PATH.MENU_ACIK_VARSAYILAN;
            } else {
                headerSection.classList.remove('homepage-style');
                headerlogo.src = PATH.LOGO_VARSAYILAN;
                menuicon.src = PATH.MENU_ACIK_VARSAYILAN;
            }
        };

        // initial check + on scroll
        checkHero();
        window.addEventListener('scroll', checkHero, { passive: true });
        window.addEventListener('resize', checkHero);
    }
});

