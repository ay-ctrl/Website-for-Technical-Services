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
            credentials: 'include', // Çerezleri gönder
            body: JSON.stringify({ username, password }), // Kullanıcı adı ve şifreyi gönderiyoruz
        });

        // Sunucudan gelen yanıta göre işlem yap
        if (response.ok) {
            window.location.href = '../UserSide/dashboard.html'; 
        } else {
            const errorText = await response.json(); // Hata mesajını JSON olarak al
            alert('Hata: ' + errorText.message); // Hata mesajını göster
        }
        } catch (error) {
            alert('Bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
        }
}

document.addEventListener("DOMContentLoaded", function () {
    const button = document.getElementById("loginButton");
    if (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            logIn();
        });
    } else {
        console.error("loginButton bulunamadı!");
    }
});