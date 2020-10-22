const express = require('express');

const db = require(__dirname + '/../../db_connect2');
const router = express.Router();

router.get('/', (req, res)=>{
    res.send('routes_store嗨嗨，商店喔')
});

//exapmle for get data from database
router.get('/goods', (req, res)=>{
    // db.query('SELECT * FROM shopgoods LIMIT 2')
    db.query('SELECT goodsId, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1')
    //`goodsId``name``categoryId``pricing``price``sale``createAt``shelfStatus`SELECT * FROM `shopgoods` WHERE 1
    .then(([results])=>{
        res.json(results);
    })
});

router.post('/goods', (req, res)=>{
    // db.query('SELECT * FROM shopgoods LIMIT 2')
    db.query('SELECT goodsId, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1')
    //`goodsId``name``categoryId``pricing``price``sale``createAt``shelfStatus`SELECT * FROM `shopgoods` WHERE 1
    .then(([results])=>{
        res.json(results);
    })
});

module.exports = router;










