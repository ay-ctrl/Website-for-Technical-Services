window.API_URL = "https://localhost:5000";
// Her Sayfa yüklendiğinde token doğrulaması yap
fetch(`${window.API_URL}/api/verify-token`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
    },
    credentials: 'include' // Cookie'nin sunucuya gönderilmesini sağlar
})
.then(response => response.json())
.then(data => {
    if (data.success) {
        window.location.href = '../UserSide/dashboard.html'; // Giriş sayfasına yönlendir
    }
})
.catch(error => {
    console.error('Error:', error);
});
document.addEventListener("DOMContentLoaded", function () {
    repairServicesCarousel();
    showCampaigns();
});

//INDEX

function toggleMenu() {
    const navMobile = document.getElementById('nav-mobile');
    navMobile.classList.toggle('open');
}
//Tamir hizmetleri kutularının carouseli
function repairServicesCarousel() {
    const carouselTrack = document.querySelector(".carousel-track");
    const serviceItems = Array.from(document.querySelectorAll(".service-item"));
    const visibleItems = 3; // Ekranda görünen öğe sayısı
    const itemWidth = carouselTrack.offsetWidth / visibleItems; // Her bir öğenin genişliği
    let currentOffset = 0;

    // Öğelerin genişliğini ayarla
    serviceItems.forEach(item => {
        item.style.flex = `0 0 ${itemWidth}px`;
    });

    // Döngüyü başlat
    function startCarousel() {
        setInterval(() => {
            // Kaydırma yap
            currentOffset -= itemWidth;
            carouselTrack.style.transition = 'transform 0.5s ease';
            carouselTrack.style.transform = `translateX(${currentOffset}px)`;

            // Kayma tamamlandığında, son öğe sıralamayı koruyacak şekilde başa eklensin
            setTimeout(() => {
                carouselTrack.style.transition = 'none'; // Geçişi sıfırla
                currentOffset += itemWidth; // Offset'i sıfırla

                // İlk öğeyi sona taşı
                const firstItem = carouselTrack.firstElementChild;
                carouselTrack.appendChild(firstItem);

                // Pozisyonu sıfırla
                carouselTrack.style.transform = `translateX(${currentOffset}px)`;
            }, 500); // Geçiş animasyon süresine uygun bir zaman
        }, 3000); // 3 saniyede bir hareket
    }

    startCarousel();
}

function showCampaigns() {
    async function fetchCampaigns() {
    try {
        const response = await fetch(`${window.API_URL}/api/campaigns`);
        const campaigns = await response.json();

        const carouselIndicators = document.querySelector('.carousel-indicators');
        const carouselInner = document.querySelector('.carousel-inner');
        const campaignDescription = document.getElementById('campaign-description');

        campaigns.forEach((campaign, index) => {
            // Indicators
            const indicator = document.createElement('li');
            indicator.setAttribute('data-bs-target', '#myCarousel');
            indicator.setAttribute('data-bs-slide-to', index);
            if (index === 0) indicator.classList.add('active');
            carouselIndicators.appendChild(indicator);

            // Slides
            const item = document.createElement('div');
            item.classList.add('carousel-item');
            if (index === 0) item.classList.add('active');

            const img = document.createElement('img');
            img.src = campaign.imageURL;
            img.alt = `Campaign ${index + 1}`;
            img.style.width = '100%';

            item.appendChild(img);
            carouselInner.appendChild(item);

            // İlk kampanya açıklamasını ekle
            if (index === 0) {
                campaignDescription.textContent = campaign.description;
            }
        });

        // Carousel'e yeni açıklama eklenince güncelleme yap
        const carousel = new bootstrap.Carousel('#myCarousel', {
            ride: 'carousel'
        });

        $('#myCarousel').on('slide.bs.carousel', function (e) {
            const index = e.to;
            campaignDescription.textContent = campaigns[index].description;
        });
        } catch (error) {
            console.error('Kampanyalar yüklenirken bir hata oluştu:', error);
        }
    }

    fetchCampaigns();
}