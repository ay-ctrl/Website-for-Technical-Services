const mongoose = require('mongoose');

beforeAll(async () => {
  await mongoose.connect("mongodb+srv://moonloversin:Wg0RBqGNubEaOiAg@backend.cnmfb.mongodb.net/NODE-API?retryWrites=true&w=majority&appName=Backend", {
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
