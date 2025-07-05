// Sayfa yüklendiğinde talepleri yükle
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});

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

// Ürünleri çekme fonksiyonu
async function fetchProducts() {
    try {
        const response = await fetch(`${window.API_URL}/products?page=${currentProductPage}`);
        const data = await response.json();

        const products = data.products;
        totalProductPages = data.totalPages;  // Global toplam sayfa sayısını güncelle

        const productList = document.getElementById('product-list');
        productList.innerHTML = '';  // Önceki ürünleri temizle

        // Ürünleri sırayla ekle
        products.forEach(product => {
            const productCard = `
                <div class="product-card" id="product-${product._id}">
                    <img src="${product.photos[0] || 'https://coflex.com.tr/wp-content/uploads/2021/01/resim-yok.jpg'}" alt="${product.name}">
                    <div class="product-info">
                        <h3>Ürün Adı: ${product.name}</h3>
                        <p class="price">Fiyat: ${product.price} TL</p>
                        <p>${product.description}</p>
                        <button class="ekle-btn" id="delete-btn-${product._id}">ÜRÜNÜ SİL</button>
                    </div>
                </div>
            `;
            productList.innerHTML += productCard;
        });

        document.getElementById('product-list').addEventListener('click', (event) => {
            if (event.target && event.target.classList.contains('ekle-btn')) {
                const productId = event.target.id.split('-')[2]; // Butonun id'sinden ürün ID'sini al
                const confirmation = confirm('Bu ürünü silmek istediğinizden emin misiniz?');
                if (confirmation) {
                    deleteProduct(productId);  // Silme işlemi fonksiyonu çağrısı
                }
            }
        });

        renderPagination();  // Pagination elemanlarını oluştur
    } catch (error) {
        console.error('Error fetching products:', error);
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