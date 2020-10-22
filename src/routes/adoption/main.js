const express = require('express');

const db = require(__dirname + '/../../db_connect2');
const router = express.Router();

router.get('/', (req, res)=>{
    res.send('routes_adpotion')
});

//exapmle for get data from database
router.get('/try-db', (req, res)=>{
    db.query('SELECT * FROM address_book LIMIT 2')
    .then(([results])=>{
        res.json(results);
    })
});

router.get('/get_pet_list/:', (req, res)=>{
    db.query(`SELECT a.*,b.detailId,c.des 
              FROM petInfo a 
              JOIN petDetail b  on a.petId =b.petId  
              JOIN tagList c on b.tagId = c.tagId and c.typeId=1 
              WHERE 1`)
    .then(([results])=>{
        //還要做資料整理 把同id的動物的tag變成array
        res.json(results);
    })
});



module.exports = router;








