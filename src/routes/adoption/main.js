const express = require('express');

const db = require(__dirname + '/../../db_connect2');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('routes_adpotion');
});

//exapmle for get data from database
router.get('/try-db', (req, res) => {
  db.query('SELECT * FROM petInfo LIMIT 2').then(([results]) => {
    res.json(results);
  });
});

let petInfoTable = null;

router.get('/get_pet_list/', (req, res) => {
  db.query(
    `SELECT a.* , c.des as tag 
     FROM petInfo a join petDetail b on a.petId = b.petId 
                    join tagList c on b.tagId = c.tagId and c.typeId = 1
     WHERE 1`
  ).then(([results]) => {
    //還要做資料整理 把同id的動物的tag變成array
    petInfoTable = results;
    let petIndex = petInfoTable[0];
    let petDataRow = petIndex;
    petDataRow.tag = [petDataRow.tag];
    let petArray = [petDataRow];
    for (let i = 1, j = 0; i < petInfoTable.length; i++) {
      if (petInfoTable[i].petId == petInfoTable[i - 1].petId) {
        petArray[j].tag.push(petInfoTable[i].tag);
      } else {
        j++;
        obj = petInfoTable[i];
        obj.tag = [obj.tag];
        petArray[j] = obj;
      }
    }
    //petData : {petId:petId,info:{name,gender,dogcat,area,address,des,Q1~Q13,tag:[tagID]}}
    res.json(petArray);
  });
});

router.get('/get_pet_list/:petId', (req, res) => {
  console.log(req.params);
  db.query(
    `SELECT a.* , c.des as tag 
       FROM petInfo a join petDetail b on a.petId = b.petId 
                      join tagList c on b.tagId = c.tagId and c.typeId = 1
       WHERE a.petId = ${req.params.petId}`
  ).then(([results]) => {
    //還要做資料整理 把同id的動物的tag變成array
    petInfoTable = results;
    let petIndex = petInfoTable[0];
    let petDataRow = petIndex;
    if (petDataRow == null) {
      console.log('null');
      res.json({ data: [], result: 'Not found' });
    }
    petDataRow.tag = [petDataRow.tag];
    let petArray = [petDataRow];
    for (let i = 1, j = 0; i < petInfoTable.length; i++) {
      if (petInfoTable[i].petId == petInfoTable[i - 1].petId) {
        petArray[j].tag.push(petInfoTable[i].tag);
      } else {
        j++;
        obj = petInfoTable[i];
        obj.tag = [obj.tag] || null;
        petArray[j] = obj;
      }
    }
    res.json({ data: petArray, results: 'seccess' });
  });
});

router.get('/get_place/', (req, res) => {
  db.query(
    `SELECT mapId, pinName, address, category, businessHours, phone, longitude, latitude, createAt FROM map WHERE 1`
  ).then(([results]) => {
    res.json({ data: results, results: 'seccess' });
  });
});

router.get('/get_place/:placeId', (req, res) => {
  db.query(
    `SELECT mapId, pinName, address, category, businessHours, phone, longitude, latitude, createAt FROM map WHERE mapId = ${req.params.placeId}`
  ).then(([results]) => {
    res.json({ data: results, results: 'seccess' });
  });
});

module.exports = router;
