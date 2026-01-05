const headermenu = document.querySelector('.headermenu');
const sidebar = document.querySelector('.sidebar');
const menuicon = document.querySelector('.menuicon');
const closeicon = document.querySelector('.closeicon');

if (headermenu && sidebar && menuicon && closeicon) {
    headermenu.addEventListener('click', () => {
        sidebar.classList.toggle('opensidebar');
        const isOpen = sidebar.classList.contains('opensidebar');
        menuicon.style.display = isOpen ? 'none' : 'block';
        closeicon.style.display = isOpen ? 'block' : 'none';

        document.body.classList.toggle('noscroll', isOpen);
    });
}

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

    const searchBarLink = document.querySelector('.searchBar a[data-href]');
    if (searchBarLink) {
        searchBarLink.addEventListener('click', (e) => {
            e.preventDefault();
            const href = searchBarLink.getAttribute('data-href');
            
            if (href) {
                window.location.href = href;
            }
        });
    }
});
