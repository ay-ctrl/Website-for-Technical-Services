// Sayfa yüklendiğinde talepleri yükle
document.addEventListener('DOMContentLoaded', () => {
    fetchRequests();
});

//MYREQUESTS
let currentRequestPage = 1;
let totalRequestsPages = 0;

// Talepleri getir
async function fetchRequests(page = 1) {

    try {
        // Backend'e sayfa numarasını ve token'ı gönder
        const response = await fetch(`${window.API_URL}/get-requests?page=${page}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include' // Cookie'nin sunucuya gönderilmesini sağlar
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
