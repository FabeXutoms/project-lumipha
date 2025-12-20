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
