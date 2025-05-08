jest.mock('../../middleware/verifyToken', () => {
  return (req, res, next) => {
    // Token kontrolü yapmadan kullanıcıyı sahte olarak ekleyip geç
    req.user = { id: 'testuserid', role: 'user' }; // Gerekirse role vs. ekle
    next();
  };
});

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../../index'); // Express uygulamasını al
const User = require('../../models/users'); // Kullanıcı modelini al
const bcrypt = require('bcrypt');

beforeEach(async () => {
  await User.deleteMany({}); // Önce tüm kullanıcıları sil

  const hashedPassword = await bcrypt.hash('correctpassword', 10); // Şifreyi hashle

  testUser = await User.create({
    username: 'testuser',
    password: hashedPassword, // Hashlenmiş şifreyi kaydet
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
});

describe('Login Tests', () => {

  // Test: Doğru kullanıcı adı ve şifre ile giriş
  test('TC_07: Login succeeds with correct credentials', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'correctpassword' }); // Burada doğru şifre kullanılıyor

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Giriş başarılı!');
  });

  // Test: Yanlış kullanıcı adı veya şifre ile giriş
  test('TC_08: Incorrect password or username blocks login', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'wrongpassword' }); // Yanlış şifre

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Kullanıcı adı veya şifre hatalı!');
  });
  test('TC_08: Incorrect password or username blocks login', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ username: 'wrongUser', password: 'correctPassword' }); // Yanlış şifre

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Kullanıcı adı veya şifre hatalı!');
  });

  // Test: Kullanıcı adı veya şifre boş bırakıldığında uyarı mesajı
  test('TC_09: Login fails with empty fields', async () => {
    const response = await request(app)
      .post('/api/login')
      .send({ username: '', password: '' }); // Boş alanlarla giriş yapmaya çalışmak

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Lütfen tüm alanları doldurun!');
  });
});

describe('Password Change Tests', () => {

  // Test: Doğru mevcut şifreyle şifre değişikliği
  test('TC_20: Password changes with correct current password', async () => {
    const response = await request(app)
      .post('/change-password')
      .send({
        username: 'testuser',
        oldPassword: 'correctpassword',
        newPassword: 'newpassword123',
        newPasswordAgain: 'newpassword123' // Yeni şifreyi onayla
      }); 

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Şifre başarıyla değiştirildi');
  });

  // Test: Yanlış mevcut şifre ile şifre değişikliği engellenmeli
  test('TC_21: Wrong current password blocks change', async () => {
    const response = await request(app)
      .post('/change-password')
      .send({
        username: 'testuser',
        oldPassword: 'wrongpassword',
        newPassword: 'newpassword123',
        newPasswordAgain: 'newpassword123' // Yeni şifreyi onayla
      }); 

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Eski şifre yanlış');
  });

  // Test: Yeni şifreler uyuşmazsa şifre değişikliği engellenmeli
  test('TC_22: New passwords do not match', async () => {
    const response = await request(app)
      .post('/change-password')
      .send({
        username: 'testuser',
        oldPassword: 'correctpassword',
        newPassword: 'newpassword123',
        confirmPassword: 'differentpassword123' // Yeni şifre ile onay şifresi farklı
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe('Yeni şifreler eşleşmiyor!');
  });
});
