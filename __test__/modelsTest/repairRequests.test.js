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
const app = require("../../index"); // Express uygulamasını al
const Request = require('../../models/repairRequests');

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

let createdRequest;
let existingRequestId;

beforeEach(async () => {
  await Request.deleteMany({});
  const validRequest = {
    name: 'Ayse Atik',
    phone: '5551234567',
    adress: 'Ankara / Gölbası',
    model: 'Samsung Galaxy S21',
    sorunlar: ['Ekran kırık', 'Şarj olmuyor'],
  };

  createdRequest = await request(app).post('/api/repairRequests').send(validRequest);
  const queryNum = createdRequest.body.queryNum;
  createdRequest = (await request(app).post('/api/repairRequests/search').send({ queryNum }));
  existingRequestId = createdRequest.body.data._id; // Geçerli bir talep ID'si al

});

describe('Repair Request Creation Tests', () => {

  describe('TC_01: Valid data should create a request successfully when mandatory fields are filled correctly', () => {
    test('should create a request successfully with valid data', async () => {
      const validRequest = {
        name: 'Ayse Atik',
        phone: '5551234567',
        adress: 'Ankara / Gölbası',
        model: 'Samsung Galaxy S21',
        sorunlar: ['Ekran kırık', 'Şarj olmuyor'],
      };

      const response = await request(app).post('/api/repairRequests').send(validRequest);
      expect(response.text).toContain('Talep başarıyla kaydedildi!');
    });
    test('should create a request successfully with valid data', async () => {
      const validRequest = {
        name: 'Ayse Atik',
        phone: '5551234567',
        adress: 'Ankara / Gölbası',
        model: 'Samsung Galaxy S21',
        sorunlar: ['Ekran kırık'],
        imei: '123456789012345', // 15 haneli IMEI numarası
      };

      const response = await request(app).post('/api/repairRequests').send(validRequest);
      expect(response.text).toContain('Talep başarıyla kaydedildi!');
    });
    test('should create a request successfully with valid data', async () => {
      const validRequest = {
        name: 'Ayse Atik',
        phone: '5551234567',
        adress: 'Ankara / Gölbası',
        model: 'Samsung Galaxy S21',
        sorunlar: ['Ekran kırık', 'Şarj olmuyor'],
        imei: '123456789012345', // 15 haneli IMEI numarası
        kilit: '12345', 
      };

      const response = await request(app).post('/api/repairRequests').send(validRequest);
      expect(response.text).toContain('Talep başarıyla kaydedildi!');
    });
    test('should create a request successfully with valid data', async () => {
      const validRequest = {
        name: 'Ayse Atik',
        phone: '5551234567',
        adress: 'Ankara / Gölbası',
        model: 'Samsung Galaxy S21',
        sorunlar: ['Ekran kırık', 'Şarj olmuyor'],
        imei: '123456789012345', // 15 haneli IMEI numarası
        kilit: '12345',
        yedekCihaz: 'evet',
      };

      const response = await request(app).post('/api/repairRequests').send(validRequest);
      expect(response.text).toContain('Talep başarıyla kaydedildi!');
    });
  });

  describe('TC_02: Should fail if any mandatory field is empty', () => {
    test('should fail if any mandatory field is empty, missing phone', async () => {
      const invalidRequest = {
        name: 'John Doe',
        adress: 'Ankara / Gölbası',
        model: 'Samsung Galaxy S21',
        sorunlar: ['Ekran kırık'],
      };

      const response = await request(app).post('/api/repairRequests').send(invalidRequest);
      expect(response.text).toContain('Geçerli bir telefon numarası girin.');
    });
    test('should fail if any mandatory field is empty, missing name', async () => {
      const invalidRequest = {
        adress: 'Ankara / Gölbası',
        model: 'Samsung Galaxy S21',
        phone: '5551234567',
        sorunlar: ['Ekran kırık'],
      };

      const response = await request(app).post('/api/repairRequests').send(invalidRequest);
      expect(response.text).toContain('Ad ve soyad zorunludur.');
    });
    test('should fail if any mandatory field is empty, missing model', async () => {
      const invalidRequest = {
        name: 'John Doe',
        adress: 'Ankara / Gölbası',
        sorunlar: ['Ekran kırık'],
        phone: '5551234567',
      };

      const response = await request(app).post('/api/repairRequests').send(invalidRequest);
      expect(response.text).toContain('Telefon modeli zorunludur.');
    });
    test('should fail if any mandatory field is empty, missing problems', async () => {
      const invalidRequest = {
        name: 'John Doe',
        adress: 'Ankara / Gölbası',
        phone: '5551234567',
        model: 'Samsung Galaxy S21',
      };

      const response = await request(app).post('/api/repairRequests').send(invalidRequest);
      expect(response.text).toContain('Lütfen en az bir sorun seçin.');
    });
  });

  describe('TC_03: Invalid inputs should be rejected for any input area', () => {

    test('should reject if IMEI is not 15 digits or empty', async () => {
      const invalidIMEIRequest = {
        name: 'John Doe',
        phone: '5551234567',
        imei: '12345',  // Geçersiz IMEI
        adress: '123 Repair St',
        model: 'Samsung Galaxy S21',
        sorunlar: ['Kamera çalışmıyor'],
      };

      const response = await request(app).post('/api/repairRequests').send(invalidIMEIRequest);
      expect(response.text).toContain('"IMEI 15 haneli olmalı veya boş bırakılmalıdır.');
    });
    test('should reject if IMEI is not 15 digits or empty', async () => {
      const invalidIMEIRequest = {
        name: 'John Doe',
        phone: '5551234567',
        imei: '12345hkkgmlşşjhccy',  // Geçersiz IMEI
        adress: '123 Repair St',
        model: 'Samsung Galaxy S21',
        sorunlar: ['Kamera çalışmıyor'],
      };

      const response = await request(app).post('/api/repairRequests').send(invalidIMEIRequest);
      expect(response.text).toContain('"IMEI 15 haneli olmalı veya boş bırakılmalıdır.');
    });

    test('should reject if phone contains letters', async () => {
      const invalidPhoneRequest = {
        name: 'Jane Doe',
        phone: 'abc5551234',
        imei: '123456789012345',
        deviceType: 'Phone',
        adress: '456 Repair Ave',
        model: 'iPhone 13',
        sorunlar: ['Şarj olmuyor'],
      };

      const response = await request(app).post('/api/repairRequests').send(invalidPhoneRequest);
      expect(response.text).toContain("Geçerli bir telefon numarası girin.");
    });

    test('invalid phone number should return an error', async () => {
      const invalidRequest = {
        name: 'John Doe',
        phone: '5551234567828', // Geçersiz telefon
        adress: 'Ankara / Gölbası',
        model: 'Samsung Galaxy S21',
        sorunlar: ['Ekran kırık'],
      };

      const response = await request(app).post('/api/repairRequests').send(invalidRequest);
      expect(response.text).toContain('Geçerli bir telefon numarası girin.');
    });

    test('should reject if name contains foreign characters', async () => {
      const invalidSorunlarRequest = {
        name: 'ayse atik<script>alert(1)</script>',
        phone: '5559876543',
        imei: '123456789012345',
        deviceType: 'Tablet',
        adress: 'Repair City',
        model: 'iPad Pro',
        sorunlar: ["ekran kırık"],  // Sorun belirtilmemiş
      };

      const response = await request(app).post('/api/repairRequests').send(invalidSorunlarRequest);
      expect(response.text).toContain('Ad ve soyad sadece harflerden oluşmalıdır.');
    });
    test('should reject if address contains foreign characters', async () => {
      const invalidSorunlarRequest = {
        name: 'ayse atik',
        phone: '5559876543',
        imei: '123456789012345',
        deviceType: 'Tablet',
        adress: 'Repair City <ayse*atik>',
        model: 'iPad Pro',
        sorunlar: ["ekran kırık"],  // Sorun belirtilmemiş
      };

      const response = await request(app).post('/api/repairRequests').send(invalidSorunlarRequest);
      expect(response.text).toContain('Adres geçersiz karakterler içeriyor.');
    });
    test('should reject if model contains foreign characters', async () => {
      const invalidSorunlarRequest = {
        name: 'ayse atik',
        phone: '5559876543',
        imei: '123456789012345',
        deviceType: 'Tablet',
        adress: 'Repair City',
        model: 'iPad Pro <script>alert(1)</script>',
        sorunlar: ["ekran kırık"],  // Sorun belirtilmemiş
      };

      const response = await request(app).post('/api/repairRequests').send(invalidSorunlarRequest);
      expect(response.text).toContain('Model geçersiz karakter içeriyor.');
    });
    test('should reject if kilit is greater than 20 characters', async () => {
      const invalidSorunlarRequest = {
        name: 'ayse atik',
        phone: '5559876543',
        imei: '123456789012345',
        deviceType: 'Tablet',
        adress: 'Repair City',
        model: 'iPad Pro ',
        sorunlar: ["ekran kırık"],  // Sorun belirtilmemiş
        kilit: '1234567890123456789012345678901234567890', // 40 karakter
      };

      const response = await request(app).post('/api/repairRequests').send(invalidSorunlarRequest);
      expect(response.text).toContain('Tuş kilidi en fazla 20 karakter olabilir.');
    });
  });
});

describe("Repair request query tests", () => {

  test("TC_04: Valid request query ID returns details", async () => {
    // 1. Talep oluşturma
    const validRequest = {
      name: 'Ayse Atik',
      phone: '5551234567',
      adress: 'Ankara / Gölbası',
      model: 'Samsung Galaxy S21',
      sorunlar: ['Ekran kırık', 'Şarj olmuyor'],
    };

    // Talep oluştur
    const createResponse = await request(app)
      .post('/api/repairRequests')
      .send(validRequest);

    // Talep oluşturulmuş mu kontrol et
    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toHaveProperty('queryNum');

    const validQueryNum = createResponse.body.queryNum; // Talep numarasını al

    // 2. Oluşturulan talep numarasına göre arama yapma
    const searchResponse = await request(app)
      .post('/api/repairRequests/search')
      .send({ queryNum: validQueryNum });

    // Sorgulama sonucu kontrol et
    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.success).toBe(true);
    expect(searchResponse.body.data).toHaveProperty('queryNum', validQueryNum);
    expect(searchResponse.body.data).toHaveProperty('name', validRequest.name);
    expect(searchResponse.body.data).toHaveProperty('phone', validRequest.phone);
    expect(searchResponse.body.data).toHaveProperty('adress', validRequest.adress);
    expect(searchResponse.body.data).toHaveProperty('sorunlar');  // Sorunlar
    expect(searchResponse.body.data).toHaveProperty('state');  // Durum
    expect(searchResponse.body.data).toHaveProperty('price');  // Ücret
  });
  test("TC_05: Invalid request query ID shows error", async () => {
    // 1. Talep oluşturma
    const validRequest = {
      name: 'Ayse Atik',
      phone: '5551234567',
      adress: 'Ankara / Gölbası',
      model: 'Samsung Galaxy S21',
      sorunlar: ['Ekran kırık', 'Şarj olmuyor'],
    };

    // Talep oluştur
    const createResponse = await request(app)
      .post('/api/repairRequests')
      .send(validRequest);

    // Talep oluşturulmuş mu kontrol et
    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toHaveProperty('queryNum');

    const invalidQueryNum = '87890';  // Geçersiz talep numarası

    // Geçersiz queryNum ile sorgulama
    const searchResponse = await request(app)
      .post('/api/repairRequests/search')
      .send({ queryNum: invalidQueryNum });

    // Yanıtın 200 olarak döneceğini kontrol et, çünkü API hala başarı durumunu 200 ile döndürüyor
    expect(searchResponse.status).toBe(200);  // 500 yerine 200 dönecek
    expect(searchResponse.body.success).toBe(false);
    expect(searchResponse.body.message).toBe('Talep bulunamadı!');
  });
  test("TC_06: Invalid format request query ID shows error", async () => {
    
    const invalidQueryNum = 'invalid_format';  // Geçersiz talep numarası

    // Geçersiz queryNum ile sorgulama
    const searchResponse = await request(app)
      .post('/api/repairRequests/search')
      .send({ queryNum: invalidQueryNum });

    // Yanıtın 200 olarak döneceğini kontrol et, çünkü API hala başarı durumunu 200 ile döndürüyor
    expect(searchResponse.status).toBe(400);  // 500 yerine 200 dönecek
    expect(searchResponse.body.success).toBe(false);
    expect(searchResponse.body.message).toBe('Geçersiz talep numarası');
  });
  test("TC_06: Missing request query ID shows error", async () => {

    // Geçersiz queryNum ile sorgulama
    const searchResponse = await request(app)
      .post('/api/repairRequests/search');

    // Yanıtın 200 olarak döneceğini kontrol et, çünkü API hala başarı durumunu 200 ile döndürüyor
    expect(searchResponse.status).toBe(400); 
    expect(searchResponse.body.success).toBe(false);
    expect(searchResponse.body.message).toBe('Geçersiz talep numarası');
  });
});

describe("Repair request update tests", () => {

  test('TC_11 - Existing request is updated successfully', async () => {
    const response = await request(app)
  .put(`/api/update-request/${existingRequestId}`)
  .send({ state: 'Completed' });

  expect(response.status).toBe(200);
  expect(response.body.state).toBe('Completed'); // 🔄 status değil, state
  });

  test('TC_12 - Existing request is updated successfully', async () => {
    const response = await request(app)
  .put(`/api/update-request/${existingRequestId}`)
  .send({ state: 'Completed' });

  expect(response.status).toBe(200);
  expect(response.body.state).toBe('Completed'); // 🔄 status değil, state
  });

});

describe("Repair request deletion tests", () => {

  test('TC_12 - Repair request is deleted successfully', async () => {
    const response = await request(app)
  .delete(`/delete-request/${existingRequestId}`);

  expect(response.status).toBe(200);
  expect(response.body.message).toBe('Talep silindi!'); 
  });

});

