const express = require('express');
const router = express.Router();

router.get('/', async function (req, res, next) {
  //firestore
  const Firestore = require('@google-cloud/firestore');
  const db = new Firestore({
    projectId: 'operating-ally-304222',
    keyFilename: 'firestore.json'
  });
  const snapshot = await db.collection('gc_ebay_list').get();
  if (snapshot.empty) {
    console.log('Not Found');
    return;
  } else {
    const data = snapshot.docs.map((doc) => doc.data());
    res.send(data);
  }
});

module.exports = router;
