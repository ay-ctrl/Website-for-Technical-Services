//DASHBOARD
window.API_URL = "http://localhost:5000";

// Her Sayfa yüklendiğinde token doğrulaması yap
async function verifyTokenBeforeLoad() {
  // Geliştirme ortamında doğrulamayı pas geç
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    return; // Token kontrolü yapılmaz, sayfa açılır
  }
  try {
    const response = await fetch(`${window.API_URL}/api/verify-token`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    const result = await response.json();

    if (!result.success) {
      window.location.href = "../CustomerSide/giris.html";
    }
  } catch (err) {
    console.error("Hata:", err);
    window.location.href = "../CustomerSide/giris.html";
  }
}
verifyTokenBeforeLoad();

function toggleMenu() {
  const navMobile = document.getElementById("nav-mobile");
  navMobile.classList.toggle("open");
}

function toggleDropdown() {
  const dropdown = document.getElementById("admin-dropdown");
  dropdown.classList.toggle("open");
}

function toggleDropdownMobile() {
  const dropdownMobile = document.getElementById("mobile-dropdown");
  dropdownMobile.classList.toggle("open");
}

document.addEventListener("DOMContentLoaded", function () {
  const dropdownButtonMobile = document.querySelector(
    ".dropdown-button-mobile",
  );
  if (dropdownButtonMobile) {
    dropdownButtonMobile.addEventListener("click", toggleDropdownMobile);
  }

  const logoutLink = document.getElementById("logoutLink");
  if (logoutLink) {
    logoutLink.addEventListener("click", logOut);
  }

  const mobileLogoutLink = document.getElementById("mlogoutLink");
  if (mobileLogoutLink) {
    mobileLogoutLink.addEventListener("click", logOut);
  }

  const hamburger = document.querySelector(".hamburger");
  if (hamburger) {
    hamburger.addEventListener("click", toggleMenu);
  }

  const prevBtn = document.getElementById("prev");
  const nextBtn = document.getElementById("next");

  let currentPage = 1; // Sayfa takip değişkeni

  if (prevBtn) {
    prevBtn.addEventListener("click", (e) => {
      e.preventDefault();
      changePage(currentPage - 1);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      changePage(currentPage + 1);
    });
  }

  const changePasswordButton = document.getElementById("change-pass-button");
  if (changePasswordButton) {
    changePasswordButton.addEventListener("click", (e) => {
      changePassword();
    });
  }

  const addProductButton = document.getElementById("add-product");
  if (addProductButton) {
    addProductButton.addEventListener("click", (e) => {
      addProduct();
    });
  }

  const addCampaignButton = document.getElementById("add-campaign");
  if (addCampaignButton) {
    addCampaignButton.addEventListener("click", (e) => {
      addCampaign();
    });
  }

  const addMediaButton = document.getElementById("add-media");
  if (addMediaButton) {
    addMediaButton.addEventListener("click", (e) => {
      addMedia();
    });
  }
});

// Döngüyü başlat
function startCarousel() {
  const carouselTrack = document.querySelector(".carousel-track");
  const serviceItems = Array.from(document.querySelectorAll(".service-item"));
  const visibleItems = 3; // Ekranda görünen öğe sayısı
  const itemWidth = carouselTrack.offsetWidth / visibleItems; // Her bir öğenin genişliği
  let currentOffset = 0;

  // Öğelerin genişliğini ayarla
  serviceItems.forEach((item) => {
    item.style.flex = `0 0 ${itemWidth}px`;
  });
  setInterval(() => {
    // Kaydırma yap
    currentOffset -= itemWidth;
    carouselTrack.style.transition = "transform 0.5s ease";
    carouselTrack.style.transform = `translateX(${currentOffset}px)`;

    // Kayma tamamlandığında, son öğe sıralamayı koruyacak şekilde başa eklensin
    setTimeout(() => {
      carouselTrack.style.transition = "none"; // Geçişi sıfırla
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
    let campaigns = [];
    try {
      const response = await fetch(`${window.API_URL}/api/campaigns`);
      campaigns = await response.json();
    } catch {
      // API çağrısı başarısız olursa örnek veriler atıyoruz
      campaigns = [
        {
          imageURL: "../images/kampanya1.jpg",
          description: "Bu kampanya 1 açıklamasıdır.",
        },
        {
          imageURL: "../images/kampanya3.jpg",
          description: "Bu kampanya 2 açıklamasıdır.",
        },
      ];
    }

    const carouselIndicators = document.querySelector(".carousel-indicators");
    const carouselInner = document.querySelector(".carousel-inner");
    const campaignDescription = document.getElementById("campaign-description");

    carouselIndicators.innerHTML = "";
    carouselInner.innerHTML = "";

    campaigns.forEach((campaign, index) => {
      // Indicators
      const indicator = document.createElement("li");
      indicator.setAttribute("data-bs-target", "#myCarousel");
      indicator.setAttribute("data-bs-slide-to", index);
      if (index === 0) indicator.classList.add("active");
      carouselIndicators.appendChild(indicator);

      // Slides
      const item = document.createElement("div");
      item.classList.add("carousel-item");
      if (index === 0) item.classList.add("active");

      const img = document.createElement("img");
      img.src = campaign.imageURL;
      img.alt = `Campaign ${index + 1}`;
      img.style.width = "100%";

      item.appendChild(img);
      carouselInner.appendChild(item);

      // İlk kampanya açıklamasını ekle
      if (index === 0) {
        campaignDescription.textContent = campaign.description;
      }
    });

    // Carousel'e yeni açıklama eklenince güncelleme yap
    const carousel = new bootstrap.Carousel("#myCarousel", {
      ride: "carousel",
    });

    $("#myCarousel").on("slide.bs.carousel", function (e) {
      const index = e.to;
      campaignDescription.textContent = campaigns[index].description;
    });
  } catch (error) {
    console.error("Kampanyalar yüklenirken bir hata oluştu:", error);
  }
}

// CHANGE PASSWORD
async function changePassword() {
  const username = document.getElementById("username").value;
  const oldPassword = document.getElementById("old-password").value;
  const newPassword = document.getElementById("new-password").value;

  // SADECE DEĞERİ OKU, ATAMA YAPMA:
  const newPasswordAgain = document.getElementById("new-password-again").value;

  // Boş alan kontrolü eklemek de iyi olur
  if (!username || !oldPassword || !newPassword) {
    alert("Lütfen tüm alanları doldurun.");
    return;
  }

  // Yeni şifrelerin eşleşip eşleşmediğini kontrol et
  if (newPassword !== newPasswordAgain) {
    alert("Yeni şifreler eşleşmiyor! Lütfen yeniden giriniz.");
    return;
  }

  try {
    const response = await fetch(`${window.API_URL}/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        oldPassword,
        newPassword,
        newPasswordAgain,
      }),
      credentials: "include", // Çerezleri gönder
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message);
      // İşlem başarılı olunca form temizleme buraya:
      document.getElementById("username").value = "";
      document.getElementById("old-password").value = "";
      document.getElementById("new-password").value = "";
      document.getElementById("new-password-again").value = "";
    } else {
      alert(result.message);
    }
  } catch (error) {
    console.error("Bir hata oluştu:", error);
    alert("Bir hata oluştu. Lütfen tekrar deneyin.");
  }
}

async function logOut() {
  try {
    const response = await fetch(`${window.API_URL}/api/logout`, {
      method: "POST",
      credentials: "include",
    });

    // Backend başarılı döndüyse veya geliştirme ortamındaysak her halükarda yönlendir
    if (response.ok) {
      window.location.href = "../CustomerSide/index.html";
    } else {
      // Eğer token süresi dolmuşsa zaten 403 döner, bu durumda da çıkış yapmış sayılırız
      window.location.href = "../CustomerSide/index.html";
    }
  } catch (error) {
    console.error("Çıkış hatası:", error);
    // Hata olsa bile kullanıcıyı ana sayfaya atalım ki takılı kalmasın
    window.location.href = "../CustomerSide/index.html";
  }
}

//ADDPRODUCT
async function addProduct() {
  const formData = new FormData();
  const name = document.getElementById("name").value;
  const priceValue = parseFloat(document.getElementById("price").value);
  const description = document.getElementById("aciklama").value;
  const fileInput = document.getElementById("dosya");

  if (isNaN(priceValue)) {
    alert("Lütfen geçerli bir fiyat giriniz!");
    return;
  }
  formData.append("name", name);
  formData.append("price", priceValue);
  formData.append("description", description);
  if (fileInput.files.length > 0) {
    formData.append("file", fileInput.files[0]);
  }

  try {
    const response = await fetch(`${window.API_URL}/upload-product`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    // Yanıt kontrolü
    if (response.ok) {
      const data = await response.json();
      alert("Ürün başarıyla eklendi!");
      document.getElementById("name").value = "";
      document.getElementById("price").value = "";
      document.getElementById("aciklama").value = "";
      document.getElementById("dosya").value = "";
    } else {
      const data = await response.json();
      console.error("Hata:", data.error || response.statusText);
      alert("Ürün eklenirken bir hata oluştu!");
    }
  } catch (err) {
    console.error("Fetch hatası:", err);
    alert("Bir hata oluştu!");
  }
}

//HAKKIMIZDA
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
          description: "Örnek medya açıklaması 1",
        },
        {
          imageURL: "../images/media2.jpg",
          description: "Örnek medya açıklaması 2",
        },
      ];
    }

    const carouselIndicators = document.querySelector(".carousel-indicators");
    const carouselInner = document.querySelector(".carousel-inner");
    const mediaDescription = document.getElementById("campaign-description");

    // Önceki içerikleri temizle
    carouselIndicators.innerHTML = "";
    carouselInner.innerHTML = "";

    medias.forEach((media, index) => {
      // Indicators
      const indicator = document.createElement("li");
      indicator.setAttribute("data-bs-target", "#myCarousel");
      indicator.setAttribute("data-bs-slide-to", index);
      if (index === 0) indicator.classList.add("active");
      carouselIndicators.appendChild(indicator);

      // Slides
      const item = document.createElement("div");
      item.classList.add("carousel-item");
      if (index === 0) item.classList.add("active");

      const img = document.createElement("img");
      img.src = media.imageURL;
      img.alt = `Media ${index + 1}`;
      img.style.width = "100%";

      item.appendChild(img);
      carouselInner.appendChild(item);

      // İlk kampanya açıklamasını ekle
      if (index === 0) {
        mediaDescription.textContent = media.description;
      }
    });

    // Carousel'e yeni açıklama eklenince güncelleme yap
    const carousel = new bootstrap.Carousel("#myCarousel", {
      ride: "carousel",
    });

    // Slayt kayarken açıklamayı güncelle
    $("#myCarousel").on("slide.bs.carousel", function (e) {
      const index = e.to; // Slaytın yeni index numarasını al
      mediaDescription.textContent = medias[index].description; // Yeni açıklamayı göster
    });
  } catch (error) {
    console.error("Medya kampanyaları yüklenirken bir hata oluştu:", error);
  }
}

//KAMPANYA EKLE
async function addCampaign() {
  // Form elemanlarını al
  const aciklama = document.getElementById("aciklama").value;
  const dosya = document.getElementById("dosya").files[0];

  const formData = new FormData();
  formData.append("aciklama", aciklama);
  formData.append("dosya", dosya);
  // Form verilerini backend'e gönder
  try {
    const response = await fetch(`${window.API_URL}/api/upload-campaign`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await response.json();
    if (data.success) {
      alert("Kampanya başarıyla eklendi!");
      document.getElementById("aciklama").value = "";
      document.getElementById("dosya").value = "";
    } else {
      alert("Bir hata oluştuuu!");
      if (data.authExpired) {
        alert(
          "Google yetkilendirme süreniz dolmuş. Lütfen tekrar giriş yapın.",
        );
        window.location.href = `${window.API_URL}/authorize`;
      }
    }
  } catch (error) {
    console.error(error);
    alert("Bir hata oluştu!2 " + error);
  }
}

//MEDYA EKLE
async function addMedia() {
  // Form elemanlarını al
  const aciklama = document.getElementById("aciklama").value;
  const dosya = document.getElementById("dosya").files[0];

  const formData = new FormData();
  formData.append("aciklama", aciklama);
  formData.append("dosya", dosya);

  // Form verilerini backend'e gönder
  try {
    const response = await fetch(`${window.API_URL}/upload-media`, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    const data = await response.json();
    if (data.success) {
      alert("Medya başarıyla eklendi!");
      // Form inputlarını boşalt
      document.getElementById("aciklama").value = "";
      document.getElementById("dosya").value = ""; // Dosya inputu da boşaltılır
    } else {
      alert("Bir hata oluştu1!");
    }
  } catch (error) {
    console.error(error);
    alert("Bir hata oluştu!2");
  }
}

// Talepleri tabloya ekler
function displayRequests(requests) {
  const tbody = document.querySelector(".tbody");
  tbody.innerHTML = ""; // Mevcut içeriği temizle

  requests.forEach((request) => {
    const row = document.createElement("tr");
    row.innerHTML = `
            <td>${request.queryNum}</td>
            <td>${request.model}</td>
            <td>${request.name}</td>
            <td>${request.phone}</td>
            <td>${request.sorunlar}</td>
            <td>${new Date(request.createdAt).toLocaleString("tr-TR")}</td>
            <td>${request.state}</td>
            <td>${request.yedekCihaz}</td>
            <td>${request.price}</td>
            <td><a href="talepDüzenle.html?id=${request._id}"><button>📝</button></a></td>
            <td><button class="delete-btn" data-id="${request._id}">🗑️</button></td>
        `;
    tbody.appendChild(row);
  });

  // Silme butonlarına event listener ekle
  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const id = e.target.getAttribute("data-id");
      deleteRequest(id);
    });
  });
}

// Taleplerim için pagination scripti
function displayPagination() {
  const paginationContainer = document.getElementById("pagination");
  paginationContainer.innerHTML = ""; // Önceki pagination'ı temizle

  // "Önceki" butonu
  if (currentRequestPage > 1) {
    const prevButton = document.createElement("a");
    prevButton.textContent = "Önceki";
    prevButton.href = "#";
    prevButton.addEventListener("click", (e) => {
      e.preventDefault();
      fetchRequests(currentRequestPage - 1); // Önceki sayfaya git
    });
    paginationContainer.appendChild(prevButton);
  }

  // Sayfa numaraları
  for (let i = 1; i <= totalRequestsPages; i++) {
    const pageButton = document.createElement("a");
    pageButton.textContent = i;
    pageButton.href = "#";
    pageButton.className = i === currentRequestPage ? "active" : ""; // Aktif sayfayı vurgula
    pageButton.addEventListener("click", (e) => {
      e.preventDefault();
      fetchRequests(i); // Tıklanan sayfayı getir
    });
    paginationContainer.appendChild(pageButton);
  }

  // "Sonraki" butonu
  if (currentRequestPage < totalRequestsPages) {
    const nextButton = document.createElement("a");
    nextButton.textContent = "Sonraki";
    nextButton.href = "#";
    nextButton.addEventListener("click", (e) => {
      e.preventDefault();
      fetchRequests(currentRequestPage + 1); // Sonraki sayfaya git
    });
    paginationContainer.appendChild(nextButton);
  }
}

// Talebi siler
async function deleteRequest(id) {
  const isConfirmed = confirm("Bu talebi silmek istediğinizden emin misiniz?");

  if (isConfirmed) {
    try {
      const response = await fetch(`${window.API_URL}/delete-request/${id}`, {
        method: "DELETE",
        credentials: "include", // Çerezleri gönder
      });

      if (response.ok) {
        fetchRequests(currentRequestPage); // Mevcut sayfayı yeniden yükle
      } else {
        console.error("Silme başarısız");
      }
    } catch (err) {
      console.error("Hata:", err);
    }
  } else {
    console.log("Silme işlemi iptal edildi.");
  }
}

function closeAll(faqs) {
  faqs.forEach((faq) => {
    let cont = faq.closest(".faq");
    cont.classList.remove("active");
  });
}
