const mongoose = require('mongoose');

const connectDB = async () => {
  try {

    //establish connection with an explicit 8-second timeout to avoid long waits in case of connection issues
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
