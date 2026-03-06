const mongoose = require('mongoose');

//const uri = 'mongodb+srv://BasothoAdmin:<SecurePass@123>@cluster0.mongodb.net/<dbname>?retryWrites=true&w=majority';
const uri = 'mongodb+srv://BasothoAdmin:SecurePass%40123@clusterbs.kfohmtz.mongodb.net/dbname?retryWrites=true&w=majority';


mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('✅ Connected to MongoDB successfully!');
    mongoose.connection.close(); // Optional: close after test
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
  });
