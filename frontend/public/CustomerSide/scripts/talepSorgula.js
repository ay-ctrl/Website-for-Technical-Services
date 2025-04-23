document.addEventListener("DOMContentLoaded", function () {
    showRequestInfo(); // veya scriptte ne çağrılıyorsa
  });

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
