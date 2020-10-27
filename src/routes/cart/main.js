const express = require('express');

const db = require(__dirname + '/../../db_connect2');
const router = express.Router();

router.get('/', (req, res)=>{
    res.send('routes_cart')
});

//exapmle for get data from database
router.get('/try-db', (req, res)=>{
    db.query('SELECT * FROM address_book LIMIT 2')
    .then(([results])=>{
        res.json(results);
    })
});


router.get('/cart/list', (req, res)=>{
    // db.query('SELECT * FROM cartlist LIMIT 2')
    db.query('SELECT cartId, goodsId, memberId, name, price, quantity, createAt, orderId, isBuy, buyNow, orderState FROM cartlist WHERE 1 ORDER BY `cartlist`.`cartId` DESC')
    // db.query('SELECT cartId, goodsId, memberId, name, price, quantity, createAt, orderId, isBuy, buyNow, orderState FROM cartlist WHERE 1 ORDER BY `cartlist`.`cartId` ASC')
    .then(([results])=>{
        res.json(results);
    })    
});

// cartlist完整內容	
// cartId
// goodsId
// memberId
// name
// price
// quantity
// createAt
// orderId
// isBuy
// buyNow
// orderState


router.get('/order/list', (req, res)=>{
    // db.query('SELECT * FROM orderlist LIMIT 2')
    db.query('SELECT orderId, memberId, totalPrice, createAt, memberName, address, mobile FROM orderlist WHERE 1 ORDER BY `orderlist`.`orderId` DESC')
    // db.query('SELECT orderId, memberId, totalPrice, createAt, memberName, address, mobile FROM orderlist WHERE 1 ORDER BY `orderlist`.`orderId` ASC')
    .then(([results])=>{
        res.json(results);
    })    
});

// orderlist完整內容	
// orderId
// memberId
// totalPrice
// createAt
// memberName
// address
// mobile


module.exports = router;










