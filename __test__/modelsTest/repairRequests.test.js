const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');  // Bellek üzerinde geçici veritabanı
const app = require('../../index');  // Express uygulamanız
const request = require('supertest');
const Request = require('../../models/repairRequests');  // Model dosyanızın yolu

let mongoServer;

// verifyToken fonksiyonunu mock etmeden önce doğru yoldan import ettiğinizden emin olun.
jest.mock('../../middleware/verifyToken.js', () => {
  return (req, res, next) => {
    // Mock işlemi: token doğrulaması başarılı
    req.user = { id: 'testUserId' };  // Token'dan gelen kullanıcı bilgisi (test için)
    next();  // Middleware'in başarılı bir şekilde geçmesini sağla
  };
});

// Test veritabanı bağlantısını oluştur
beforeAll(async () => {
  // MongoMemoryServer ile geçici veritabanı oluşturuyoruz
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();

  // Mongoose'u bu geçici veritabanına bağla
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  // Testten önce veritabanını temizle
  await mongoose.connection.db.dropDatabase();
});

afterAll(async () => {
  // Testler bitince veritabanı bağlantısını kapat
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Repair Request API', () => {
  // Geçerli veri ile talep yükleme
  it('should create a new repair request when valid data is sent', async () => {
    const validData = {
      model: 'iPhone 12',
      name: 'Ayşe Yılmaz',
      phone: '0555555555',
      adress: 'İstanbul, Beşiktaş',
      sorunlar: ['Ekran arızası', 'Şarj olmama'],
      imei: '123456789012345',
      kilit: 'yok',
      yedekCihaz: 'evet',
      price: '500',
    };

    const res = await request(app)
      .post('/api/repairRequests')
      .send(validData);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe('Talep başarıyla kaydedildi!');
    expect(res.body.queryNum).toBeDefined();
  });

  // Eksik verilerle talep yükleme
  it('should return an error when missing required fields', async () => {
    const invalidData = {
      name: 'Ayşe Yılmaz',
      phone: '0555555555',
      adress: 'İstanbul, Beşiktaş',
      sorunlar: ['Ekran arızası'],
    };

    const res = await request(app)
      .post('/api/repairRequests')
      .send(invalidData);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Bir hata oluştu, lütfen tekrar deneyin.');
  });

  // Hatalı JSON formatıyla talep gönderme
  it('should return an error when invalid data format is used', async () => {
    const invalidFormatData = 'model=iPhone 12&name=Ayşe Yılmaz&phone=0555555555'; // Form verisi formatı

    const res = await request(app)
      .post('/api/repairRequests')
      .send(invalidFormatData);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Bir hata oluştu, lütfen tekrar deneyin.');
  });

  // Veritabanı hatası senaryosu
  it('should handle database connection errors gracefully', async () => {
    // Mongoose save fonksiyonunu mock'layarak veritabanı hatası simüle ediyoruz
    jest.spyOn(Request.prototype, 'save').mockImplementationOnce(() => {
      throw new Error('Veritabanı hatası');
    });

    const validData = {
      model: 'iPhone 12',
      name: 'Ayşe Yılmaz',
      phone: '0555555555',
      adress: 'İstanbul, Beşiktaş',
      sorunlar: ['Ekran arızası', 'Şarj olmama'],
      imei: '123456789012345',
      kilit: 'yok',
      yedekCihaz: 'evet',
      price: '500',
    };

    const res = await request(app)
      .post('/api/repairRequests')
      .send(validData);

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Bir hata oluştu, lütfen tekrar deneyin.');
  });
});

// DATA UPDATE TEST
describe('Update Repair Request', () => {

  // Geçerli verilerle güncelleme testi
  test('Should update repair request with valid data', async () => {
    const validData = {
      state: "In Progress",
      price: "150.00",
      processMade: "Replaced engine parts",
      repairDescription: "The engine had a malfunction, and parts were replaced."
    };

    const response = await request(app)
      .put('/api/update-request/12345') // Örnek ID
      .send(validData);

    expect(response.status).toBe(200);
    expect(response.body.state).toBe(validData.state);
    expect(response.body.price).toBe(validData.price);
    expect(response.body.processMade).toBe(validData.processMade);
    expect(response.body.repairDescription).toBe(validData.repairDescription);
  });

});
