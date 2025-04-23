// Sayfa yüklendiğinde URL parametresindeki id'yi alıp, talebi yükleyin
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const requestId = urlParams.get('id');
    loadRepairRequest(requestId);

    const saveButton = document.querySelector('.save-btn');
    const printButton = document.querySelector('.print-btn');

    // "KAYDET" butonuna event listener ekle
    if (saveButton) {
        saveButton.addEventListener('click', function() {
            updateRepairRequest(requestId);
        });
    }

    // "YAZDIR" butonuna event listener ekle
    if (printButton) {
        printButton.addEventListener('click', function() {
            printRequestInfo();
        });
    }
});


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