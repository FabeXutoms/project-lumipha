document.addEventListener('DOMContentLoaded', function() {

    const headers = document.querySelectorAll('.accordion-header');
    const contents = document.querySelectorAll('.accordion-content');

    headers.forEach(header => {
        header.addEventListener('click', () => {

            const item = header.closest('.accordion-item');
            const targetContent = item.querySelector('.accordion-content');
            
            const isActive = targetContent.classList.contains('active');
            if (isActive) {
                targetContent.classList.remove('active');
                header.classList.remove('active');
            } else {
                targetContent.classList.add('active');
                header.classList.add('active');
            }
        });
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filterApplyButton');
    if (!filterButtons || filterButtons.length === 0) return;
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.currentTarget.classList.toggle('active');
        });
    });
});