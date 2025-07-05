document.addEventListener('DOMContentLoaded', () => {
    sssScript();
});
//SSS
function sssScript(){
    
    const faqs = document.querySelectorAll(".faq button");

    faqs.forEach(faq => {
        faq.addEventListener('click', (e) => {
            let cont = e.target.closest(".faq");
            if (cont.classList.contains("active")) {
                cont.classList.remove("active")
            } else {
                closeAll(faqs);
                cont.classList.add('active');
            }
        })
    });

}