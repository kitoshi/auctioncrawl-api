const express = require("express");
const router = express.Router();

router.get("/", async function (req, res, next) {
  //firestore
  const Firestore = require("@google-cloud/firestore");

  const db = new Firestore({
    projectId: "operating-ally-304222",
    keyFilename: 'firestore.json',
  });
  const gcdata = db.collection('combinedGC').doc('gcdata');
  const doc = await gcdata.get();
  if (!doc.exists){
    console.log("Not Found");
  } else {
    console.log("GET result ->" + doc.data());
    res.send(doc.data());
  }
})

module.exports = router;