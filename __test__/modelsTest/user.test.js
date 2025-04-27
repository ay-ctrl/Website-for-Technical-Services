const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../../models/users');  // User modelini import edin
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Veritabanına bağlan
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Şifreyi hash'le ve kullanıcıyı ekle
  const hashedPassword = await bcrypt.hash('ayda54ayda', 10);
  await User.create({ username: 'ayse', password: hashedPassword });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Tests
describe('User model tests', () => {
  it('should authenticate a user with correct password', async () => {
    const authenticatedUser = await User.authenticate('ayse', 'ayda54ayda');
    expect(authenticatedUser).not.toBeNull(); // Kullanıcı doğrulandı
    expect(authenticatedUser.username).toBe('ayse'); // Kullanıcı adı doğru olmalı
  });

  it('should return null if username is incorrect', async () => {
    const authenticatedUser = await User.authenticate('wrongUser', 'ayda54ayda');
    expect(authenticatedUser).toBeNull(); // Yanlış kullanıcı adı ile giriş yapılmamalı
  });

  it('should return null if password is incorrect', async () => {
    const authenticatedUser = await User.authenticate('ayse', 'wrongPassword');
    expect(authenticatedUser).toBeNull(); // Yanlış şifre ile giriş yapılmamalı
  });
});
