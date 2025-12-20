document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.searchBarContainer');
    if (searchInput) {
        searchInput.focus();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const filterButtons = document.querySelectorAll('.filterApplyButton');
    if (!filterButtons || filterButtons.length === 0) return;
    filterButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            filterButtons.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
        });
    });
});
