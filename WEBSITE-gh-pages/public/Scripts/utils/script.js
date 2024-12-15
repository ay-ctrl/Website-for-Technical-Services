document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.querySelector('.form');
    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const username = document.querySelector('#username').value;
        const password = document.querySelector('#password').value;

        const response = await fetch('/api/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.text();
        alert(result); // Kullanıcıya mesaj göster
    });
});
