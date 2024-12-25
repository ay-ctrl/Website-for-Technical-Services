//DASHBOARD
window.API_URL = "http://145.223.100.63:5000";
// Döngüyü başlat
function startCarousel() {
    const carouselTrack = document.querySelector(".carousel-track");
    const serviceItems = Array.from(document.querySelectorAll(".service-item"));
    const visibleItems = 3; // Ekranda görünen öğe sayısı
    const itemWidth = carouselTrack.offsetWidth / visibleItems; // Her bir öğenin genişliği
    let currentOffset = 0;

    // Öğelerin genişliğini ayarla
    serviceItems.forEach(item => {
        item.style.flex = `0 0 ${itemWidth}px`;
    });
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

//CHANGEPASSWORD
async function changePassword(){
    const username = document.getElementById('username').value;
    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;

    try {
        const response = await fetch(`${window.API_URL}/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, oldPassword, newPassword }),
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message); // Şifre başarıyla değiştirildi
            document.getElementById('username').value="";
            document.getElementById('old-password').value="";
            document.getElementById('new-password').value="";
            document.getElementById('new-password-again').value="";
        } else {
            alert(result.message); // Hata mesajı
        }
        } catch (error) {
            console.error('Bir hata oluştu:', error);
            alert('Bir hata oluştu. Lütfen tekrar deneyin.');
        }
}

//ADDPRODUCT
async function addProduct(){
    const formData = new FormData();
    const name = document.getElementById('name').value;
    const priceValue = parseFloat(document.getElementById('price').value);
    const description = document.getElementById('aciklama').value;
    const fileInput = document.getElementById('dosya');

    if (isNaN(priceValue)) {
        alert('Lütfen geçerli bir fiyat giriniz!');
        return;
    }
    formData.append('name', name);
    formData.append('price', priceValue);
    formData.append('description', description);
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }

    try {
        const response = await fetch(`${window.API_URL}/upload-product`, {
            method: 'POST',
            body: formData,
        });

         // Yanıt kontrolü
         if (response.ok) {
            const data = await response.json();
            alert('Ürün başarıyla eklendi!');
            document.getElementById('name').value="";
            document.getElementById('price').value="";
            document.getElementById('aciklama').value="";
            document.getElementById('dosya').value="";
        } else {
            const data = await response.json();
            console.error('Hata:', data.error || response.statusText);
            alert('Ürün eklenirken bir hata oluştu!');
        }
    } catch (err) {
        console.error('Fetch hatası:', err);
        alert('Bir hata oluştu!');
    }
}

//HAKKIMIZDA
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

//KAMPANYA EKLE
async function addCampaign() {
    // Form elemanlarını al
    const aciklama = document.getElementById('aciklama').value;
    const dosya = document.getElementById('dosya').files[0];

    const formData = new FormData();
    formData.append('aciklama', aciklama);
    formData.append('dosya', dosya);

    // Form verilerini backend'e gönder
    try {
        const response = await fetch(`${window.API_URL}/api/upload-campaign`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            alert('Kampanya başarıyla eklendi!');
            document.getElementById('aciklama').value="";
            document.getElementById('dosya').value="";
        } else {
            alert('Bir hata oluştu1!');
        }
    } catch (error) {
        console.error(error);
        alert('Bir hata oluştu!2');
    }
}

//MEDYA EKLE
async function addMedia() {
    // Form elemanlarını al
    const aciklama = document.getElementById('aciklama').value;
    const dosya = document.getElementById('dosya').files[0];

    const formData = new FormData();
    formData.append('aciklama', aciklama);
    formData.append('dosya', dosya);

    // Form verilerini backend'e gönder
    try {
        const response = await fetch(`${window.API_URL}/upload-media`, {
            method: 'POST',
            body: formData
        });
        const data = await response.json();
        if (data.success) {
            alert('Medya başarıyla eklendi!');
            // Form inputlarını boşalt
            document.getElementById('aciklama').value = '';
            document.getElementById('dosya').value = '';  // Dosya inputu da boşaltılır
        } else {
            alert('Bir hata oluştu1!');
        }
        } catch (error) {
            console.error(error);
            alert('Bir hata oluştu!2');
        }
}

//MYREQUESTS
let currentRequestPage = 1;
let totalRequestsPages = 0;

// Talepleri getirir
async function fetchRequests(page = 1) {
    const token = localStorage.getItem('token'); // Token'ı localStorage'dan al

    if (!token) {
        console.error('Token bulunamadı. Lütfen giriş yapın.');
        return;
    }

    try {
        // Backend'e sayfa numarasını ve token'ı gönder
        const response = await fetch(`${window.API_URL}/get-requests?page=${page}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,  // Token'ı Authorization başlığında gönder
            },
        });

        // Yanıtı kontrol et
        if (!response.ok) {
            throw new Error('İstek başarısız oldu.');
        }

        const data = await response.json();
        
        // Veri formatını kontrol et
        if (data && data.requests && Array.isArray(data.requests)) {
            currentRequestPage = data.currentPage;
            totalRequestsPages = data.totalPages;

            displayRequests(data.requests); // Talepleri göster
            displayPagination(totalRequestsPages); // Sayfalama göster
        } else {
            console.error('Geçersiz veri formatı:', data);
        }
    } catch (err) {
        console.error('Error fetching requests:', err);
        alert('Talepler alınırken bir hata oluştu.');
    }
}

// Talepleri tabloya ekler
function displayRequests(requests) {
    const tbody = document.querySelector('.tbody');
    tbody.innerHTML = '';  // Mevcut içeriği temizle

    requests.forEach(request => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${request.queryNum}</td>
            <td>${request.model}</td>
            <td>${request.name}</td>
            <td>${request.phone}</td>
            <td>${request.sorunlar}</td>
            <td>${new Date(request.createdAt).toLocaleString('tr-TR')}</td>
            <td>${request.state}</td>
            <td>${request.yedekCihaz}</td>
            <td>${request.price}</td>
            <td><a href="talepDüzenle.html?id=${request._id}"><button>📝</button></a></td>
            <td><button onclick="deleteRequest('${request._id}')">🗑️</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Taleplerim için pagination scripti
function displayPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';  // Önceki pagination'ı temizle

    // "Önceki" butonu
    if (currentRequestPage > 1) {
        const prevButton = document.createElement('a');
        prevButton.textContent = 'Önceki';
        prevButton.href = '#';
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            fetchRequests(currentRequestPage - 1); // Önceki sayfaya git
        });
        paginationContainer.appendChild(prevButton);
    }

    // Sayfa numaraları
    for (let i = 1; i <= totalRequestsPages; i++) {
        const pageButton = document.createElement('a');
        pageButton.textContent = i;
        pageButton.href = '#';
        pageButton.className = i === currentRequestPage ? 'active' : '';  // Aktif sayfayı vurgula
        pageButton.addEventListener('click', (e) => {
            e.preventDefault();
            fetchRequests(i); // Tıklanan sayfayı getir
        });
        paginationContainer.appendChild(pageButton);
    }

    // "Sonraki" butonu
    if (currentRequestPage < totalRequestsPages) {
        const nextButton = document.createElement('a');
        nextButton.textContent = 'Sonraki';
        nextButton.href = '#';
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            fetchRequests(currentRequestPage + 1); // Sonraki sayfaya git
        });
        paginationContainer.appendChild(nextButton);
    }
}

// Talebi siler
async function deleteRequest(id) {
    const isConfirmed = confirm('Bu talebi silmek istediğinizden emin misiniz?');

    if (isConfirmed) {
        try {
            const response = await fetch(`${window.API_URL}/delete-request/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchRequests(currentRequestPage); // Mevcut sayfayı yeniden yükle
            } else {
                console.error('Silme başarısız');
            }
        } catch (err) {
            console.error('Hata:', err);
        }
    } else {
        console.log('Silme işlemi iptal edildi.');
    }
}

//PRODUCTS
let currentProductPage = 1;  // Başlangıç sayfası
let totalProductPages = 1;   // Toplam sayfa sayısı

function changePage(page) {
    if (page < 1 || page > totalProductPages) return;  // Geçersiz sayfalar için hiçbir şey yapma
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
        totalProductPages = data.totalPages;  // Global toplam sayfa sayısını güncelle

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
                        <button class="ekle-btn" onclick="deleteProduct('${product._id}')">ÜRÜNÜ SİL</button>
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
        const prevButton = document.createElement('a');
        prevButton.textContent = 'Önceki';
        prevButton.href = '#';
        prevButton.addEventListener('click', (e) => {
            e.preventDefault();
            changePage(currentProductPage - 1);
        });
        paginationContainer.appendChild(prevButton);
    }

    // Sayfa numaraları
    for (let i = 1; i <= totalProductPages; i++) {
        const pageButton = document.createElement('a');
        pageButton.textContent = i;
        pageButton.href = '#';
        pageButton.className = i === currentProductPage ? 'active' : '';  // Aktif sayfayı vurgula
        pageButton.addEventListener('click', (e) => {
            e.preventDefault();
            changePage(i);
        });
        paginationContainer.appendChild(pageButton);
    }

    // "Sonraki" butonu
    if (currentProductPage < totalProductPages) {
        const nextButton = document.createElement('a');
        nextButton.textContent = 'Sonraki';
        nextButton.href = '#';
        nextButton.addEventListener('click', (e) => {
            e.preventDefault();
            changePage(currentPage + 1);
        });
        paginationContainer.appendChild(nextButton);
    }
}

async function deleteProduct(productId) {
    try {
        const response = await fetch(`${window.API_URL}/products/${productId}`, {
            method: 'DELETE',  // HTTP DELETE isteği gönderiyoruz
        });

        if (response.ok) {
            alert("Ürün başarıyla silindi.");
            // Ürünü sayfadan kaldır
            document.getElementById(`product-${productId}`).remove();
        } else {
            alert("Ürün silinirken bir hata oluştu.");
        }
    } catch (error) {
        console.error("Silme işlemi sırasında hata:", error);
        alert("Silme işlemi sırasında bir hata oluştu.");
    }
}

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

function closeAll(faqs) {
    faqs.forEach(faq => {
        let cont = faq.closest(".faq");
        cont.classList.remove('active');
    })
}

//TALEP DÜZENLE
async function loadRepairRequest(id) {
    try {
    const response = await fetch(`${window.API_URL}/get-request/${id}`);
    if (!response.ok) {
        throw new Error(`Talep bulunamadı, HTTP Durum: ${response.status}`);
    }

    const data = await response.json();

    // Tablodaki verileri güncelle (Eğer tablo için bir <tbody id="tableBody"> varsa)
    const tableBody = document.getElementById('tableBody');
    if (tableBody) {
        tableBody.innerHTML = ''; // Önceki tablo satırlarını temizle

        Object.entries(data).forEach(([key, value]) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${key}</td>
                <td>${value}</td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Form alanlarını doldur
    for (const [key, value] of Object.entries(data)) {
        const formElement = document.getElementById(key); // ID, data'nın key'ine eşitse
        if (formElement) {
            formElement.value = value || ''; // Form alanı mevcutsa doldur
        }
    }
    } catch (error) {
    console.error('Talep yüklenemedi:', error);
    }
}

// Talebi güncelleme işlemi
async function updateRepairRequest() {
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('id');

    const updatedData = {
        state: document.getElementById('state').value,
        price: document.getElementById('price').value,
        processMade: document.getElementById('processMade').value,
        repairDescription: document.getElementById('repairDescription').value
    };

    try {
        const response = await fetch(`${window.API_URL}/api/update-request/${requestId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        const data = await response.json();
        if (data) {
            alert('Talep başarıyla güncellendi');
        }
    } catch (error) {
        console.error('Talep güncellenemedi:', error);
    }
}

//Talep formunun yazıcı ile yazdırılması
function printRequestInfo () {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Başlık
    doc.setFontSize(16);
    doc.text('Talep Bilgileri', 105, 20, null, null, 'center'); // Ortalanmış başlık

    // Formdaki bilgileri al
    const queryNum = document.getElementById('queryNum').value;
    const name = document.getElementById('name').value;
    const model = document.getElementById('model').value;
    const phone = document.getElementById('phone').value;
    const adress = document.getElementById('adress').value;
    const imei = document.getElementById('imei').value;
    const kilit = document.getElementById('kilit').value;
    const phoneTakenDate = document.getElementById('phoneTakenDate').value;
    const sorunlar = document.getElementById('sorunlar').value;
    const state = document.getElementById('state').value;
    const processMade = document.getElementById('processMade').value;
    const price = document.getElementById('price').value;
    const repairDescription = document.getElementById('repairDescription').value;

    // Form verilerini düzenli bir şekilde PDF'ye ekleme
    let yPosition = 30;

    // Başlıklar
    const labels = [
    'Talep No:', 'Müsteri Adi:', 'Telefon Modeli:', 'Telefon No:', 'Adres:', 'IMEI:',
    'Tus Kilidi:', 'Cihazin Gelis Tarihi:', 'Problem:', 'Durum:', 'Yapilan İslem:',
    'Ücret:', 'Onarim Açiklamasi:'
    ];

    const values = [
    queryNum, name, model, phone, adress, imei, kilit, phoneTakenDate,
    sorunlar, state, processMade, price, repairDescription
    ];

    // Veri ekleme işlemi
    doc.setFontSize(12);
    for (let i = 0; i < labels.length; i++) {
    doc.text(`${labels[i]} ${values[i]}`, 10, yPosition);
    yPosition += 10;
    }

    // Renkli kutu (onarım açıklaması için)
    doc.setDrawColor(0, 0, 255); // Mavi
    doc.setFillColor(220, 220, 220); // Gri
    doc.rect(10, yPosition, 190, 30, 'F'); // Kutuyu çiz
    doc.setFontSize(12);
    doc.text('Onarım Açıklaması:', 10, yPosition + 10);
    doc.text(repairDescription, 10, yPosition + 20);

    // PDF dosyasını kaydet
    doc.save('talep_bilgisi.pdf');
}
