//INDEX
window.API_URL = "http://145.223.100.63:5000";
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

//LOGIN
async function logIn() {

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        // Backend'e login isteği gönder
        const response = await fetch(`${window.API_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }), // Kullanıcı adı ve şifreyi gönderiyoruz
        });

        // Sunucudan gelen yanıta göre işlem yap
        if (response.ok) {
            const data = await response.json();  // Yanıtı JSON formatında al
            // Token'ı localStorage'a kaydet
            localStorage.setItem('token', data.token);
            alert("Giriş başarılı :)");
            window.location.href = '../UserSide/dashboard.html'; 
        } else {
            const errorText = await response.json(); // Hata mesajını JSON olarak al
            alert('Hata: ' + errorText.message); // Hata mesajını göster
        }
        } catch (error) {
            console.error('Hata:', error);
            alert('Sunucuya bağlanırken bir hata oluştu.');
        }
}

//HAKKIMIZDA
function showMedias() {
    async function fetchMedias() {
        try {
        const response = await fetch(`${window.API_URL}/api/medias`);
        const medias = await response.json();

        const carouselIndicators = document.querySelector('.carousel-indicators');
        const carouselInner = document.querySelector('.carousel-inner');
        const mediaDescription = document.getElementById('campaign-description');

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

            // İlk kampanya açıklamasını ekle
            if (index === 0) {
                mediaDescription.textContent = media.description;
            }
        });

        // Carousel'e yeni açıklama eklenince güncelleme yap
        const carousel = new bootstrap.Carousel('#myCarousel', {
            ride: 'carousel'
        });

        // Slayt kayarken açıklamayı güncelle
        $('#myCarousel').on('slide.bs.carousel', function (e) {
            const index = e.to; // Slaytın yeni index numarasını al
            mediaDescription.textContent = medias[index].description; // Yeni açıklamayı göster
        });
        } catch (error) {
            console.error('Medya kampanyaları yüklenirken bir hata oluştu:', error);
        }
    }

    fetchMedias();
}

//PRODUCTS
let currentProductPage = 1;  // Başlangıç sayfası
let totalProductsPages = 1;   // Toplam sayfa sayısı

function changePage(page) {
    if (page < 1 || page > totalProductsPages) return;  // Geçersiz sayfalar için hiçbir şey yapma
    currentProductPage = page;
    fetchProducts();  // Sayfa değiştiğinde ürünleri al
    // Sayfa başına kaydır
    window.scrollTo({
        top: 0,
        behavior: 'smooth'  // Yumuşak kaydırma
    });
}

async function fetchProducts() {
    try {
        const response = await fetch(`${window.API_URL}/products?page=${currentProductPage}`);
        const data = await response.json();

        const products = data.products;
        totalProductsPages = data.totalPages;  // Global toplam sayfa sayısını güncelle

        const productList = document.getElementById('product-list');
        productList.innerHTML = '';

        products.forEach(product => {
            const productCard = `
                <div class="product-card" id="product-${product._id}">
                    <img src="${product.photos[0] || 'https://coflex.com.tr/wp-content/uploads/2021/01/resim-yok.jpg'}" alt="${product.name}">
                    <div class="product-info">
                        <h3>Ürün Adı: ${product.name}</h3>
                        <p class="price">Fiyat: ${product.price} TL</p>
                        <p>${product.description}</p>
                    </div>
                </div>
            `;
            productList.innerHTML += productCard;
        });

        renderPagination();  // Pagination elemanlarını oluştur
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

function renderPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';  // Önceki pagination'ı temizle

    // "Önceki" butonu
    if (currentProductPage > 1) {
    const prevLink = document.createElement('a');
    prevLink.textContent = 'Önceki';
    prevLink.href = '#';
    prevLink.addEventListener('click', (e) => {
        e.preventDefault();  // Varsayılan link davranışını engelle
        changePage(currentPage - 1);
    });
    paginationContainer.appendChild(prevLink);
    }

    // Sayfa numaraları
    for (let i = 1; i <= totalProductsPages; i++) {
    const pageLink = document.createElement('a');
    pageLink.textContent = i;
    pageLink.href = '#';
    pageLink.className = i === currentProductPage ? 'active' : '';  // Aktif sayfayı vurgula
    pageLink.addEventListener('click', (e) => {
        e.preventDefault();
        changePage(i);
    });
    paginationContainer.appendChild(pageLink);
    }

    // "Sonraki" butonu
    if (currentProductPage < totalProductsPages) {
    const nextLink = document.createElement('a');
    nextLink.textContent = 'Sonraki';
    nextLink.href = '#';
    nextLink.addEventListener('click', (e) => {
        e.preventDefault();
        changePage(currentProductPage + 1);
    });
    paginationContainer.appendChild(nextLink);
    }
}

//SSS
function sssScript(){
    const faqs = document.querySelectorAll(".faq button");
    faqs.forEach(faq => {
        faq.addEventListener('click', (e) => {
            let cont = e.target.closest(".faq");
            if (cont.classList.contains("active")) {
                cont.classList.remove("active");
            } else {
                closeAll(faqs);
                cont.classList.add('active');
            }
        });
    });
}

function closeAll(faqs) {
    faqs.forEach(faq => {
        let cont = faq.closest(".faq");
        cont.classList.remove('active');
    });
}

//TALEP OLUSTUR
async function talepOlustur(event){
    event.preventDefault();
    const form = document.getElementById('requestForm');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries()); // Form verilerini bir nesneye çevir
    try {
        const response = await fetch(`${window.API_URL}/api/repairRequests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            // Sunucuya başarılı şekilde gönderildi
            const responseData = await response.json(); // Sunucudan gelen yanıtı al

            const queryNum = responseData.queryNum; 
            
            localStorage.setItem("queryNum",queryNum);
            window.location.href = 'talepOlustur2.html'; // Yönlendirme
            alert('Talebiniz başarıyla oluşturuldu!');
        } else {
            throw new Error('Sunucudan bir hata alındı.');
        }
        } catch (error) {
            alert('Bir hata oluştu: ' + error.message);
        }
}

//TALEP OLUSTUR 2
function showTalepNo(){
    // Talep numarasını localStorage'dan al
    const queryNum = window.localStorage.getItem('queryNum');

    if (queryNum) {
        // Talep numarasını sayfada göster
        document.getElementById('talepNo').textContent = queryNum;
    } else {
        alert('Talep numarası bulunamadı.');
    }
}

//TALEP SORGULA
// Sayfa yüklendiğinde localStorage'dan veriyi al
function showRequestInfo(){
    const repairRequestData = JSON.parse(localStorage.getItem('repairRequestData'));

    if (repairRequestData) {
        // Veriyi tabloya doldur
        document.getElementById('customerName').textContent = repairRequestData.name;
        document.getElementById('customerPhone').textContent = repairRequestData.phone;
        document.getElementById('customerAddress').textContent = repairRequestData.adress;
        document.getElementById('problemDescription').textContent = repairRequestData.sorunlar.join(', ');
        document.getElementById('createdAt').textContent = new Date(repairRequestData.createdAt).toLocaleDateString();
        document.getElementById('status').textContent = repairRequestData.state || 'Bilinmiyor';
        document.getElementById('price').textContent = repairRequestData.price || 'Belirlenmedi';
        // Tabloyu göster
        document.getElementById('resultTable').style.display = 'table';
    } else {
        alert('Talep verisi bulunamadı.');
    }
}

//TALEP SORGULA2
async function talepSorgula() {
    const queryNum = document.getElementById('queryNumInput').value;

    if (!queryNum) {
        alert("Lütfen bir talep numarası girin.");
        return;
    }

    try {
        const response = await fetch(`${window.API_URL}/api/repairRequests/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ queryNum })
        });

        const data = await response.json();

        if (data.success) {
            // Talep verilerini localStorage'a kaydet
            localStorage.setItem('repairRequestData', JSON.stringify(data.data));

            // Başka sayfaya yönlendir
            window.location.href = 'talepSorgula.html'; // Talep sonucu sayfasına yönlendir
        } else {
            alert(data.message); // Talep bulunamazsa hata mesajı
        }
    } catch (error) {
        console.error(error);
        alert('Bir hata oluştu.');
    }
}
