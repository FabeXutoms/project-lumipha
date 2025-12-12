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

const formButton = document.querySelector('.contactFormButton');
const formSentContainer = document.getElementById('formSentContainer');
const formInputs = document.querySelectorAll('.verification-input');
const kvkkCheckbox = document.getElementById('kvkkOnay');

formButton.addEventListener('click', function(event) {
    event.preventDefault();

    if (!kvkkCheckbox.checked) {
        
        return;
    }


    formInputs.forEach(input => {
        input.classList.add('hidden-anim');
    });

    formButton.textContent = 'Gönderildi';
    formButton.disabled = true; 
    formButton.style.cursor = 'default';

    setTimeout(() => {

        formInputs.forEach(input => {
            input.style.display = 'none';
        });

        if (formSentContainer) {
            formSentContainer.style.display = 'flex';
            
            setTimeout(() => {
                formSentContainer.classList.add('active');
            }, 20);
        }

    }); 
});