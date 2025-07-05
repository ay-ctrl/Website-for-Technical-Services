const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect("your mongoDB Atlas connection URI", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoose.connection.close(); // MongoDB bağlantısını kapat
});

describe('Database Connection', () => {
  it('should be connected to MongoDB', async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});
