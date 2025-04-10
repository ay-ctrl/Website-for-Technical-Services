const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');

// credentials.json'dan client bilgilerini al
const credentials = JSON.parse(fs.readFileSync('credentials.json'));
const { client_secret, client_id, redirect_uris } = credentials.web;

const oAuth2Client = new google.auth.OAuth2(
  client_id, client_secret, redirect_uris[0]
);

// Daha önce alınmış token varsa oku
if (fs.existsSync('token.json')) {
  const token = JSON.parse(fs.readFileSync('token.json'));
  oAuth2Client.setCredentials(token);

  // Token'ı yenile
  oAuth2Client.refreshAccessToken((err, newToken) => {
    if (err) {
      console.error('Token yenileme hatası:', err);
      // Yeni token almak için auth URL'si oluştur
      getNewToken();
    } else {
      console.log("✅ Token başarıyla yenilendi.");
      // Yenilenmiş token'ı kaydet
      fs.writeFileSync('token.json', JSON.stringify(newToken));
    }
  });
} else {
  // Token yoksa kullanıcıdan izin al
  getNewToken();
}

//here yoou will get the code from url http://localhost:5000/oauth2callback?code=AUTHORIZATION_CODE
function getNewToken() {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/drive.file'],
  });
  console.log('🔗 Şu bağlantıya git ve kodu yapıştır:\n', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Kod: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Token alınamadı:', err);
      oAuth2Client.setCredentials(token);
      fs.writeFileSync('token.json', JSON.stringify(token));
      console.log('✅ Token kaydedildi: token.json');
    });
  });
}
