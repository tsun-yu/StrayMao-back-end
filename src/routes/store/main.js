const express = require('express');
const jwt = require('jsonwebtoken');
const db = require(__dirname + '/../../db_connect2');
const router = express.Router();


router.get('/', (req, res)=>{
    res.send('routes_store嗨嗨，商店喔')
});

//exapmle for get data from database
router.get('/goods', (req, res)=>{
    // db.query('SELECT * FROM shopgoods LIMIT 2')
    db.query('SELECT goodsId, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1')
    .then(([results])=>{
        res.json(results);
    })
});

router.get('/goods', (req, res)=>{
    // db.query('SELECT * FROM shopgoods LIMIT 2')
    db.query('SELECT goodsId, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1')
    .then(([results])=>{
        res.json(results);
    })
});

router.post('/goods', async (req, res)=>{
    const data = {...req.body};
    data.createAt = new Date();
    const sql = "INSERT INTO `shopgoods` set ?";
    const [{affectedRows, insertId}] = await db.query(sql, [ data ]);
    // [{"fieldCount":0,"affectedRows":1,"insertId":860,"info":"","serverStatus":2,"warningStatus":1},null]

    res.json({
        success: !!affectedRows,
        affectedRows,
        insertId,
    });
});

// router.post('/add', upload.none(), async (req, res)=>{
//     const data = {...req.body};
//     data.created_at = new Date();
//     const sql = "INSERT INTO `address_book` set ?";
//     const [{affectedRows, insertId}] = await db.query(sql, [ data ]);
//     // [{"fieldCount":0,"affectedRows":1,"insertId":860,"info":"","serverStatus":2,"warningStatus":1},null]

//     res.json({
//         success: !!affectedRows,
//         affectedRows,
//         insertId,
//     });
// });

module.exports = router;










