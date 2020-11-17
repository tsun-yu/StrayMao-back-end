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

router.get('/test_list/', (req, res) => {
  let arr = [];
  for (let i = 0; i < 100; i++) {
    arr.push({ id: i, text: `hello ${i}` });
  }

  let data = { data: arr, results: 'success' };
  // res.json(data);
  res.json({ data: data, results: 'success' });
});

router.get('/get_recom', (req, res) => {
  db.query(
    `SELECT c.*,w.des as tag,x.count  from 
    (
        SELECT b.petId ,COUNT(b.petId) as count
        from userPreference a join  petDetail b  on a.tagId = b.tagId
        where a.memberId = -1
        and b.petId in (
            select petId 
            from petDetail f
            where f.tagId in (SELECT  tagId from userPreference g where g.memberId = -1 and g.tagId<3)
        )
        GROUP by b.petId
    ) as x join petInfo c on x.petId = c.petId
         JOIN petDetail v on c.petId = v.petId
             JOIN taglist w on v.tagId = w.linkTypeId and (w.typeId=9 or w.typeId=10)
    
    order by x.count desc ,c.petId,w.linkTypeId desc `
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
        obj.heart = false;
        obj.tag = [obj.tag];
        petArray[j] = obj;
      }
    }

    //petData : {petId:petId,info:{name,gender,dogcat,area,address,des,Q1~Q13,tag:[tagID]}}
    res.json({ data: petArray, results: 'success' });
  });
});

router.get('/get_pet_list/m/:memberId?', (req, res) => {
  db.query(
    `SELECT a.* , c.des as tag 
     FROM petInfo a join petDetail b on a.petId = b.petId 
                    join tagList c on  (b.tagId = c.linkTypeId and c.typeId = 10) or (b.tagId = c.linkTypeId and c.typeId = 9)
     WHERE 1`
  )
    .then(([results]) => {
      let userId = 0;
      if (req.params.memberId !== undefined) {
        userId = req.params.memberId;
        return db.query(
          `SELECT a.* , c.des as tag,d.memberId as heart 
          FROM petInfo a join petDetail b on a.petId = b.petId 
                         join tagList c on (b.tagId = c.linkTypeId and c.typeId = 10) or (b.tagId = c.linkTypeId and c.typeId = 9)
                        left  JOIN heartList d on d.itemId = a.petId and d.type = 3 and d.memberId = ${userId}
          WHERE 1 order by a.petId,c.linkTypeId desc`
        );
      }
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
          obj.heart = false;
          obj.tag = [obj.tag];
          petArray[j] = obj;
        }
      }
      //petData : {petId:petId,info:{name,gender,dogcat,area,address,des,Q1~Q13,tag:[tagID]}}
      return { data: petArray, results: 'success' };
    })
    .then((data) => {
      if (data.results === undefined) {
        // //還要做資料整理 把同id的動物的tag變成array
        let results = [...data][0];
        petInfoTable = results;
        let petIndex = petInfoTable[0];
        let petDataRow = petIndex;
        petDataRow.heart = petInfoTable[0].heart > 0 ? true : false;
        petDataRow.tag = [petDataRow.tag];
        let petArray = [petDataRow];

        for (let i = 1, j = 0; i < petInfoTable.length; i++) {
          if (petInfoTable[i].petId == petInfoTable[i - 1].petId) {
            petArray[j].tag.push(petInfoTable[i].tag);
          } else {
            j++;
            obj = petInfoTable[i];
            obj.heart = petInfoTable[i].heart > 0 ? true : false;
            obj.tag = [obj.tag];
            petArray[j] = obj;
          }
        }
        res.json({ data: petArray, results: 'success' });
      } else {
        res.json(data);
      }
    });
});
router.get('/get_pet_list/:petId', (req, res) => {
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
    res.json({ data: petArray, results: 'success' });
  });
});
router.get('/get_place/', (req, res) => {
  db.query(
    `SELECT mapId, pinName, address, category, businessHours, phone, longitude, latitude, createAt FROM map WHERE 1`
  ).then(([results]) => {
    res.json({ data: results, results: 'success' });
  });
});
router.get('/get_place/:placeId', (req, res) => {
  db.query(
    `SELECT mapId, pinName, address, category, businessHours, phone, longitude, latitude, createAt FROM map WHERE mapId = ${req.params.placeId}`
  ).then(([results]) => {
    res.json({ data: results, results: 'success' });
  });
});
router.post('/pet_heart', (req, res) => {
  const userId = req.body.userId;
  const petId = req.body.petId;

  const url = `INSERT INTO heartList( type, memberId, itemId) 
               VALUES (3,${userId},${petId}) `;
  db.query(url).then(([results]) => {
    res.json({ data: results, results: 'success' });
  });
});
router.delete('/pet_heart', (req, res) => {
  const userId = req.body.userId;
  const petId = req.body.petId;
  const url = `DELETE FROM heartList
                where itemId = ${petId} 
                  and memberId = ${userId}
                  and type = 3
                  `;
  db.query(url).then(([results]) => {
    res.json({ data: results, results: 'success' });
  });
});

router.post('/get_adop_pet', (req, res) => {
  const userId = req.body.userId;
  const petId = req.body.petId;

  const url = `insert into adopList(memberId,petId) values(${userId} ,${petId} )`;
  console.log(url);
  db.query(url).then(([results]) => {
    res.json({ data: results, results: 'success' });
  });
});

router.post('/pet_heart_init', (req, res) => {
  const userId = req.body.userId;
  const petId = req.body.petId;
  const url = `select listId FROM heartList
                where itemId = ${petId} 
                  and memberId = ${userId}
                  and type = 3`;
  db.query(url).then(([results]) => {
    res.json({ data: results, results: 'success' });
  });
});

router.get('/get_map', (req, res) => {
  const url = `SELECT * FROM map order by category`;
  db.query(url).then(([results]) => {
    let retArr = [];
    let cate = 0;
    for (let i = 0, j = -1; i < results.length; i++) {
      if (results[i].category == cate) {
        retArr[j].info.push(results[i]);
      } else {
        retArr.push({ category: results[i].category, info: [results[i]] });
        cate = results[i].category;
        j++;
      }
    }

    res.json({ data: retArr, results: 'success' });
  });
});
router.get('/adop_list/:memberId', (req, res) => {
  let memberId = req.params.memberId;
  const url = `SELECT a.petId,b.pic FROM adopList a join petInfo b on a.petId = b.petId join memberlist c on a.memberId = c.memberId  WHERE a.memberId = ${memberId}`;
  db.query(url).then(([results]) => {
    res.json({ data: results, results: 'success' });
  });
});
module.exports = router;
