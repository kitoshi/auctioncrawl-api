const express = require("express");
const router = express.Router();

router.get("/", async function (req, res, next) {
  //firestore
  const Firestore = require("@google-cloud/firestore");
  const data = [];
  const db = new Firestore({
    projectId: "operating-ally-304222",
    keyFilename: "firestore.json",
  });
  const snapshot = await db.collection("combinedGC").get();
  if (snapshot.empty) {
    console.log("Not Found");
    return;
  } else {
    snapshot.forEach((doc) => {
      data.push(doc.data());
    });
  }
  res.send(data);
});

module.exports = router;
