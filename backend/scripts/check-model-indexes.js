const mongoose = require('mongoose');
const path = require('path');

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/younovate_lms', { dbName: 'younovate_lms' });
    console.log('Connected');
    
    const modelPath = path.join(__dirname, '..', 'src', 'models', 'WorkshopModels.js');
    console.log('Loading model from:', modelPath);
    const WorkshopModels = require(modelPath);
    const WorkshopAttendance = WorkshopModels.WorkshopAttendance;
    console.log('WorkshopAttendance model loaded');
    
    const db = mongoose.connection.db;
    const indexes = await db.collection('workshopattendances').indexes();
    console.log('Indexes:');
    indexes.forEach(idx => console.log(' ', idx.name, '-', JSON.stringify(idx.key)));
    
    await mongoose.disconnect();
    console.log('Done');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

main();
