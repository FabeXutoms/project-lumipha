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

const liveContainer = document.querySelector('.liveWebContainer');
if (liveContainer) {
    liveContainer.addEventListener('click', (e) => {
        const targetUrl = liveContainer.dataset.href || liveContainer.querySelector('a')?.href;

        liveContainer.classList.add('liveWebContainer--active');

        const ANIM_DURATION = 200;
        setTimeout(() => {
            liveContainer.classList.remove('liveWebContainer--active');
            if (targetUrl) {
                window.location.href = targetUrl;
            }
        }, ANIM_DURATION);
    });
}

const jobsAlignment = document.querySelector('.forJobsAlignment');
const plusContainer = document.querySelector('.forJobsAlignment .plusIcon');
if (jobsAlignment && plusContainer) {

    const lastJob = plusContainer.closest('.containerForJobs');
    const originalNextSibling = lastJob.nextElementSibling;
    lastJob.addEventListener('click', (e) => {
        e.preventDefault();

        const isExpanded = jobsAlignment.classList.toggle('expanded');

        if (isExpanded) {
            jobsAlignment.appendChild(lastJob);
        } else {
            if (originalNextSibling) jobsAlignment.insertBefore(lastJob, originalNextSibling);
        }

        document.querySelectorAll('.extraJob').forEach(el => {
            el.setAttribute('aria-hidden', isExpanded ? 'false' : 'true');
        });

        plusContainer.classList.toggle('expanded', isExpanded);
    });
}

const jobSheet = document.querySelector('.jobSheet');
const jobSheetOverlay = document.querySelector('.jobSheetOverlay');
const jobSheetHandle = document.querySelector('.jobSheetHandleWrap');

const jobCards = Array.from(document.querySelectorAll('.containerForJobs')).filter(card => !card.querySelector('.plusIcon'));

let sheetOpen = false;
let dragStartY = 0;
let currentTranslate = 0;
const CLOSE_DRAG_THRESHOLD = 80;

function openJobSheet(){
    if (!jobSheet || !jobSheetOverlay) return;
    sheetOpen = true;
    currentTranslate = 0;
    jobSheet.style.transform = 'translateY(0)';
    document.body.classList.add('jobSheet-open');
    jobSheet.setAttribute('aria-hidden','false');
    jobSheetOverlay.setAttribute('aria-hidden','false');
}

function closeJobSheet(){
    if (!jobSheet || !jobSheetOverlay) return;
    sheetOpen = false;
    jobSheet.style.transform = '';
    document.body.classList.remove('jobSheet-open');
    jobSheet.setAttribute('aria-hidden','true');
    jobSheetOverlay.setAttribute('aria-hidden','true');
}

jobCards.forEach(card => {
    card.addEventListener('click', (e) => {
        e.preventDefault();
        openJobSheet();
    });
});

if (jobSheetOverlay){
    jobSheetOverlay.addEventListener('click', closeJobSheet);
}

function attachDrag(el){
    if (!el) return;
    el.addEventListener('pointerdown', (e) => {
        if (!sheetOpen) return;
        dragStartY = e.clientY;
        currentTranslate = 0;
        jobSheet.style.transition = 'none';
        const moveHandler = (ev) => {
            const delta = ev.clientY - dragStartY;
            if (delta > 0){
                currentTranslate = delta;
                jobSheet.style.transform = `translateY(${delta}px)`;
            }
        };
        const upHandler = (ev) => {
            const delta = ev.clientY - dragStartY;
            jobSheet.style.transition = '';
            if (delta > CLOSE_DRAG_THRESHOLD){
                closeJobSheet();
            } else {
                jobSheet.style.transform = 'translateY(0)';
            }
            window.removeEventListener('pointermove', moveHandler);
            window.removeEventListener('pointerup', upHandler);
            window.removeEventListener('pointercancel', upHandler);
        };
        window.addEventListener('pointermove', moveHandler);
        window.addEventListener('pointerup', upHandler);
        window.addEventListener('pointercancel', upHandler);
    });
}

attachDrag(jobSheetHandle);

// Press effect for imgWC on worksContainer click
const worksContainers = document.querySelectorAll('.worksContainer');
worksContainers.forEach(container => {
    container.addEventListener('click', (e) => {
        const imgWC = container.querySelector('.imgWC');
        if (imgWC) {
            if (!imgWC.dataset.originalSrc) {
                imgWC.dataset.originalSrc = imgWC.src;
            }
            
            // Add active state
            imgWC.classList.add('active');
            imgWC.src = 'images/Arrow-black.svg';
            
            // Remove after short duration (press effect)
            setTimeout(() => {
                imgWC.classList.remove('active');
                imgWC.src = imgWC.dataset.originalSrc;
            }, 300);
        }
    });
});

document.addEventListener('DOMContentLoaded', function(){
    const likeBtn = document.querySelector('.reaction-btn.like-btn');
    const dislikeBtn = document.querySelector('.reaction-btn.dislike-btn');
    if (!likeBtn || !dislikeBtn) return;

    function setActive(btn, other){
        const isActive = btn.classList.contains('active');
        if (isActive) {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        } else {
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            // remove other if active (only one at a time)
            if (other.classList.contains('active')){
                other.classList.remove('active');
                other.setAttribute('aria-pressed', 'false');
            }
        }
    }

    likeBtn.addEventListener('click', () => setActive(likeBtn, dislikeBtn));
    dislikeBtn.addEventListener('click', () => setActive(dislikeBtn, likeBtn));
});