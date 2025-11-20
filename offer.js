document.addEventListener("DOMContentLoaded", function() {
    
    const tabs = document.querySelectorAll('.formtab'); 
    const nextBtn = document.getElementById('nextButton');
    const backBtn = document.getElementById('backButton');
    const btnContainer = document.getElementById('buttonContainer');
    const nextBtnTitle = document.querySelector('.nextbuttontitle');
    const bgEffect = document.querySelector('.bgeffect');
    

    const stepMapping = [
        { majorIndex: 0, rectIndex: 0 }, 
        { majorIndex: 0, rectIndex: 1 }, 
        { majorIndex: 1, rectIndex: 0 }, 
        { majorIndex: 2, rectIndex: 0 }, 
        { majorIndex: 2, rectIndex: 1 } 
    ];


    const allStepDivs = [
        document.getElementById('step1'),
        document.getElementById('step2'),
        document.getElementById('step3')
    ];

    let currentStep = 0; 


    window.addEventListener('load', function() {
        showTab(currentStep);
    });

    function showTab(n) {

        tabs.forEach(tab => tab.style.display = 'none');
        tabs[n].style.display = 'block';

        updateVisualSteps(n);

        if (n === 0) {
            btnContainer.classList.remove('adim-2');
        } else {
            btnContainer.classList.add('adim-2');
        }

        if (n === tabs.length - 1) {
            nextBtnTitle.innerText = "Tamamla";
        } else {
            nextBtnTitle.innerText = "İlerle";
        }
    }

    function updateVisualSteps(n) {
        const currentMap = stepMapping[n];
        const currentMajorIndex = currentMap.majorIndex; 
        
        allStepDivs.forEach((stepDiv, index) => {
            
            stepDiv.classList.remove('active'); 
            stepDiv.querySelectorAll('.formsteprectangle').forEach(r => r.classList.remove('fsr-active'));

            if (index === currentMajorIndex) {
                stepDiv.classList.add('active'); 
                
                if (bgEffect) {
                    const left = stepDiv.offsetLeft;
                    
                    bgEffect.style.left = `${left}px`;
                }

                const rectangles = stepDiv.querySelectorAll('.formsteprectangle');
                if(rectangles[currentMap.rectIndex]) {
                    rectangles[currentMap.rectIndex].classList.add('fsr-active');
                }
            }
        });
    }

    window.addEventListener('resize', function() {
        showTab(currentStep);
    });

    nextBtn.addEventListener('click', function() {
        if (currentStep < tabs.length - 1) {
            currentStep++;
            showTab(currentStep);
        } else {
            
        }
    });

    backBtn.addEventListener('click', function() {
        if (currentStep > 0) {
            currentStep--;
            showTab(currentStep);
        }
    });
});

const businessScaleRadios = document.querySelectorAll('input[name="business-scale"]');
const allContainers = document.querySelectorAll('.rb-buttons-alignment-styles'); 

const updateRadioStyles = function() {
    allContainers.forEach(container => {
        const radioInput = container.querySelector('input[name="business-scale"]');
        
        container.classList.remove('rb-active');
        
        if (radioInput && radioInput.checked) {
            container.classList.add('rb-active');
        }
    });
};

allContainers.forEach(container => {
    container.addEventListener('click', function(event) {
        
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'LABEL') {
            return;
        }

        const radioInput = container.querySelector('input[name="business-scale"]');
        
        if (radioInput) {
            radioInput.checked = true;
            updateRadioStyles();
        }
    });
});

businessScaleRadios.forEach(radio => {
    radio.addEventListener('change', updateRadioStyles);
    
    if (radio.checked) {
        updateRadioStyles();
    }
});


function handleServiceSelection() {
    const serviceCards = document.querySelectorAll('.pcontainer');
    const SELECTED_ICON_SRC = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMyIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBvbHlsaW5lIHBvaW50cz0iMjAgNiA5IDE3IDQgMTIiLz48L3N2Zz4=';
    const DEFAULT_ICON_SRC = 'images/offericonbase.svg';

    serviceCards.forEach(card => {
        
        const checkInitialState = function() {
            const iconElement = card.querySelector('.offercontainericon');
            if (!iconElement) return;

            if (card.classList.contains('pcontainer-active')) {
                iconElement.src = SELECTED_ICON_SRC;
            } else {
                iconElement.src = DEFAULT_ICON_SRC;
            }
        };
        checkInitialState();

        card.addEventListener('click', function(event) {
            event.preventDefault(); 
            
            const iconElement = this.querySelector('.offercontainericon');
            const isActive = this.classList.toggle('pcontainer-active');
            
            if (iconElement) {
                if (isActive) {
                    iconElement.src = SELECTED_ICON_SRC;
                } else {
                    iconElement.src = DEFAULT_ICON_SRC;
                }
            }
        });
    });
}

handleServiceSelection();
