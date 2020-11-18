const express = require("express");

const db = require(__dirname + "/../../db_connect2");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("routes_homepage");
});

//exapmle for get data from database
// router.get('/try-db', (req, res)=>{
//     db.query('SELECT * FROM address_book LIMIT 2')
//     .then(([results])=>{
//         res.json(results);
//     })
// });

router.post("/question", (req, res) => {
  let taglist = [];
  let insertValue = "";

  for (i = 0; i < req.body.arr.length; i++) {
    req.body.arr[i] == 1 && taglist.push(i + 1);
  }
  let total = taglist.length;
  console.log(taglist);

  for (i = 0; i < total; i++) {
    i !== total - 1
      ? (insertValue += `(-1,${taglist[i]}),`)
      : (insertValue += `(-1,${taglist[i]})`);
  }
  db.query(`DELETE FROM userPreference WHERE memberId=-1`)
    .then(() => {
      let sql =
        `INSERT INTO userPreference(memberId, tagId) VALUES` + insertValue;
      console.log(sql);
      return db.query(sql);
    })
    .then(() => {
      res.json(req.body);
    });
});

module.exports = router;
