const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const serviceAccount = require('./cred.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'gs://staff-tracker-8101d.appspot.com'
  });


const firestore = admin.firestore();




const app = express();

app.set('view engine', 'ejs');

// Set up multer for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage });

app.get('/', (req, res) => {
  res.render('form');
});

app.post('/submit', upload.single('image'), async (req, res) => {
    const { name, surname, position, phone, idNumber, email } = req.body;
    const image = req.file;
  //display submitted info on the console
   console.log('Name:', name);
   console.log('Surname:', surname);
   console.log('Position:', position);
   console.log('Phone Number:', phone);
   console.log('ID Number:', idNumber);
   console.log('Email:', email);
   console.log('Image:', image);
 

    // Do something with the form data and uploaded image
    const bucket = admin.storage().bucket();
    const file = bucket.file(image.originalname);
    await file.save(image.buffer, {
      metadata: {
        contentType: image.mimetype
      }
    });
  
    // Save the form data to Firestore
    await firestore.collection('forms').add({
      name,
      surname,
      position,
      phone,
      idNumber,
      email,
      imageUrl: `gs://staff-tracker-8101d.appspot.com/${image.originalname}`
    });
  
    res.render('data', { name, surname,position, phone, idNumber, email, image });
  });
  

app.get('/success', (req, res) => {
  res.send('Form submitted successfully!');
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
