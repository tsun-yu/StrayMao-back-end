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



//收藏
router.post('/goods_heart', (req, res) => {
    const memberId = req.body.memberId;
    const goodsId = req.body.goodsId;
    console.log(typeof memberId);
    console.log(memberId);
    const url = `INSERT INTO heartList( type, memberId, itemId) 
     VALUES (1,${memberId},${goodsId}) `;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
  });

router.delete('/goods_heart', (req, res) => {
    const memberId = req.body.memberId;
    const goodsId = req.body.goodsId;
    const url = `DELETE FROM heartList
                  where goodsId = ${goodsId} 
                    and memberId = ${memberId}
                    and type = 1
                    `;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
  });

router.post('/goods_heart_init', (req, res) => {
  const memberId = req.body.memberId;
  const goodsId = req.body.goodsId;
  const url = `select listId FROM heartList
                where goodsId = ${goodsId} 
                  and memberId = ${memberId}
                  and type = 1
                  `;
    db.query(url).then(([results]) => {
        res.json({ data: results, results: 
        'success' });
    });
});



//購物車
//post store/goods資料到cartlist (放store/main.js？)

router.post('/cartinsert', (req, res) => {
    const memberId = req.body.memberId;
    const goodsId = req.body.goodsId;
    const name = req.body.name;
    const price = req.body.price;
    const quantity = req.body.quantity;
    // console.log(typeof userId);
    // console.log(userId);
    const url = `INSERT INTO cartlist(memberId, goodsId, name, price, quantity, createAt, orderId, isBuy, buyNow, orderState) 
     VALUES (${memberId},${goodsId},${name},${price},${quantity},NOW(),?,?,?,?) `;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
});

router.post('/cartlist', (req, res) => {
    const memberId = req.body.memberId;
    const goodsId = req.body.goodsId;
    // console.log(typeof userId);
    // console.log(userId);
    const url = `SELECT cartId, goodsId, memberId, name, price, quantity, createAt, orderId, isBuy, buyNow, orderState FROM cartlist WHERE memberId=${memberId} `;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
});

router.post('/cartupdate', (req, res) => {
    const cartId= req.body.cartId;
    const memberId = req.body.memberId;
    const goodsId = req.body.goodsId;
    const name = req.body.name;
    const price = req.body.price;
    const quantity = req.body.quantity;
    // console.log(typeof userId);
    // console.log(userId);
    //update `cart_list_01` set `quantity`=? WHERE `goods_id`=$goods_id
    const url = `UPDATE cartlist SET price=${price}, quantity=${quantity}, createAt=NOW() WHERE cartId=${cartId}`;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
});

router.delete('/cartlist', (req, res) => {
    const memberId = req.body.memberId;
    const cartId = req.body.cartId;
    const url = `DELETE FROM cartlist
                  where cartId = ${cartId} 
                    and memberId = ${memberId}
                    `;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
});

// router.get('/cartlist/:memberId', (req, res)=>{
//     console.log(req.params);
//     // db.query('SELECT * FROM cartlist LIMIT 2')
//     db.query('SELECT cartId, goodsId, memberId, name, price, quantity, createAt, orderId, isBuy, buyNow, orderState FROM cartlist WHERE memberId = ${req.params.memberId}')
//     // db.query('SELECT cartId, goodsId, memberId, name, price, quantity, createAt, orderId, isBuy, buyNow, orderState FROM cartlist WHERE 1 ORDER BY `cartlist`.`cartId` ASC')
//     .then(([results])=>{
//         cartInfoTable = results;
//         let cartIndex = cartInfoTable[0];
//         let cartDataRow = cartIndex;
//         if (cartDataRow == null) {
//             console.log('null');
//             res.json({ data: [], result: 'Not found' });
//         }
//         cartDataRow.tag = [cartDataRow.tag];
//         let cartArray = [cartDataRow];
//         for (let i = 1, j = 0; i < cartInfoTable.length; i++) {
//             if (cartInfoTable[i].memberId == cartInfoTable[i - 1].memberId) {
//                 cartArray[j].tag.push(cartInfoTable[i].tag);
//             } else {
//               j++;
//               obj = cartInfoTable[i];
//               obj.tag = [obj.tag] || null;
//               cartArray[j] = obj;
//             }
//           }
//         res.json({ data: cartArray, results: 'success' });
//     })
// });

// router.get('/cartlist', (req, res)=>{
//     // db.query('SELECT * FROM cartlist LIMIT 2')
//     db.query('SELECT cartId, goodsId, memberId, name, price, quantity, createAt, orderId, isBuy, buyNow, orderState FROM cartlist WHERE 1 ORDER BY `cartlist`.`cartId` DESC')
//     // db.query('SELECT cartId, goodsId, memberId, name, price, quantity, createAt, orderId, isBuy, buyNow, orderState FROM cartlist WHERE 1 ORDER BY `cartlist`.`cartId` ASC')
//     .then(([results])=>{
//         res.json(results);
//     })
// });



//購買
//(update 購物車資料到cartlist)





//訂單
//post 購買頁面表單資料 到orderlist

router.post('/orderinsert', (req, res) => {
    const orderId = req.body.orderId;
    const memberId = req.body.memberId;
    const totalPrice = req.body.totalPrice;
    const memberName = req.body.memberName;
    const address = req.body.address;
    const mobile = req.body.mobile;
    const productDelivery = req.body.productDelivery;
    const paymentTerm = req.body.paymentTerm;
    // console.log(typeof userId);
    // console.log(userId);
    const url = `INSERT INTO orderlist(orderId, memberId, totalPrice, createAt, memberName, address, mobile, orderState, productDelivery, paymentTerm ) 
     VALUES (${orderId}, ${memberId}, ${totalPrice}, NOW(), ${memberName}, ${address}, ${mobile}, ?, ${productDelivery}, ${paymentTerm}) `;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
});

router.post('/order', (req, res) => {
    const memberId = req.body.memberId;
    const orderId = req.body.orderId;
    // console.log(typeof userId);
    // console.log(userId);
    const url = `SELECT orderlist.orderId, orderlist.memberId, cartlist.name, cartlist.quantity, orderlist.totalPrice, orderlist.createAt, orderlist.memberName, orderlist.address, orderlist.orderState, orderlist.productDelivery, orderlist.paymentTerm FROM orderlist LEFT JOIN cartlist ON orderlist.orderId=cartlist.orderId WHERE orderlist.orderId=${orderId};`;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
});

router.post('/orderlist', (req, res)=>{
    const memberId = req.body.memberId;
    const orderId = req.body.orderId;
    const url = `SELECT orderlist.orderId, orderlist.memberId, orderlist.createAt, cartlist.cartId, cartlist.name, cartlist.quantity
    FROM orderlist
    JOIN cartlist ON orderlist.orderId=cartlist.orderId
    WHERE orderlist.memberId=${memberId};`;

    db.query(url).then(([results]) => {
        console.log(results[0].orderId)
        let a=[]
        let b=[]
        let oldId=0
        let bigArr=[]

        for(let i=0,j=-1;i<results.length;i++){
            if(results[i].orderId==oldId){bigArr[j].data.push({...results[i]})}
            else{
                bigArr.push(
                    {
                        orderId:results[i].orderId,
                        // data:[{"cartId":results[i].cartId}]
                        data:[{...results[i]}]
                    })
                    oldId=results[i].orderId
                    j++
                }
        }
        console.log(bigArr[2])
        res.json({ data: bigArr, results: 'success' });
      });
});



// cartlist完整內容	
//cartId
//goodsId
//memberId
//name
//price
//quantity
//createAt
//orderId
//isBuy
//buyNow
//orderState

// orderlist完整內容
//orderId
//memberId
//totalPrice
//createAt
//memberName
//address
//mobile
//orderState
//productDelivery
//paymentTerm



module.exports = router;










