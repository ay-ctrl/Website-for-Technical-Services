document.addEventListener("DOMContentLoaded", function () {
    showTalepNo(); // veya burada çağrılan işlem
});

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