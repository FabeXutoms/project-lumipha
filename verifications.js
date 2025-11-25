const inputs = document.querySelectorAll('.otp-input');
const timerElement = document.getElementById('countdown');
const nextButton = document.getElementById('nextButton');
const backButton = document.getElementById('backButton');
const btnText = document.getElementById('btnText');
const inputSwitcher = document.getElementById('inputSwitcher');
const contactInput = document.getElementById('contactInput');
const contactLabel = document.getElementById('contactLabel');

const steps = [
    document.getElementById('step1'),
    document.getElementById('step2'),
    document.getElementById('step3')
];

let currentStep = 0;
let isEmailMode = false;

backButton.addEventListener('click', (e) => {
    e.preventDefault();

    if (currentStep > 0) {
        steps[currentStep].style.display = 'none';
        
        currentStep--;
        
        steps[currentStep].style.display = 'block';

        if (currentStep < 2) {
            btnText.innerText = "Devam Et";
        }
    } 

    else {
        window.location.href = "orders-code.html";
    }
});

nextButton.addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
        
        steps[currentStep].style.display = 'none';
        currentStep++;
        steps[currentStep].style.display = 'block';
        
        if (currentStep === 2) {
            btnText.innerText = "Siparişlerimi Görüntüle";
        }

        if (currentStep === 1) {
            startTimer();
        }
    } else {
    }
});

inputSwitcher.addEventListener('click', (e) => {
    e.preventDefault(); 

    if (!isEmailMode) {
        contactLabel.innerText = "E-Posta Adresi";
        contactInput.type = "text"; 
        contactInput.placeholder = "E-Posta Adresiniz";
        contactInput.value = ""; 
        inputSwitcher.innerText = "Telefon Numarası";
        isEmailMode = true;
    } else {
        contactLabel.innerText = "Telefon Numarası";
        contactInput.type = "tel";
        contactInput.placeholder = "Telefon Numaranız";
        contactInput.value = ""; 
        inputSwitcher.innerText = "E-Posta Adresi";
        isEmailMode = false;
    }
});

inputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
        const value = e.target.value;

        if (!/^\d+$/.test(value)) {
            e.target.value = '';
            return;
        }

        if (value) {
            input.classList.add('filled');
        } else {
            input.classList.remove('filled');
        }

        if (value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace') {
            if (!input.value && index > 0) {
                inputs[index - 1].focus();
            } 
            input.classList.remove('filled');
        }
    });
    
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').split('');
        
        inputs.forEach((inp, i) => {
            if (pasteData[i]) {
                inp.value = pasteData[i];
                inp.classList.add('filled');
                if (i === inputs.length - 1) inp.focus();
            }
        });
    });
});

function startTimer() {
    let timeLeft = 60;
    if(window.otpTimer) clearInterval(window.otpTimer);
    
    window.otpTimer = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(window.otpTimer);
            timerElement.innerText = "Süre doldu";
        } else {
            timeLeft--;
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            timerElement.innerText = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        }
    }, 1000);
}