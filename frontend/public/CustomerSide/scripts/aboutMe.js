window.API_URL = "https://localhost:5000"; 
document.addEventListener("DOMContentLoaded",function () {
    showMedias();
});
function toggleMenu() {
    const navMobile = document.getElementById('nav-mobile');
    navMobile.classList.toggle('open');
}
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

//HAKKIMIZDA
function showMedias() {
    async function fetchMedias() {
        try {
    let medias = [];
    try {
      const response = await fetch(`${window.API_URL}/api/medias`);
      medias = await response.json();
    } catch {
      // API çağrısı başarısızsa örnek medya verileri ata
      medias = [
        {
          imageURL: "../images/media1.jpg",
          description: "Örnek medya açıklaması 1"
        },
        {
          imageURL: "../images/media2.jpg",
          description: "Örnek medya açıklaması 2"
        }
      ];
    }

    const carouselIndicators = document.querySelector('.carousel-indicators');
    const carouselInner = document.querySelector('.carousel-inner');
    const mediaDescription = document.getElementById('campaign-description');

    // Önceki içerikleri temizle
    carouselIndicators.innerHTML = "";
    carouselInner.innerHTML = "";

    medias.forEach((media, index) => {
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
      img.src = media.imageURL;
      img.alt = `Media ${index + 1}`;
      img.style.width = '100%';

      item.appendChild(img);
      carouselInner.appendChild(item);

      // İlk medya açıklamasını ekle
      if (index === 0) {
        mediaDescription.textContent = media.description;
      }
    });

    // Carousel'i başlat veya güncelle
    const carousel = new bootstrap.Carousel('#myCarousel', { ride: 'carousel' });

    // Slayt değiştiğinde açıklamayı güncelle
    $('#myCarousel').on('slide.bs.carousel', function (e) {
      const index = e.to;
      mediaDescription.textContent = medias[index].description;
    });

  } catch (error) {
    console.error('Medya kampanyaları yüklenirken bir hata oluştu:', error);
  }
}

fetchMedias();
}