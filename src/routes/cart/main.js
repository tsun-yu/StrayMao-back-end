const { json } = require('express');
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
    // console.log(typeof memberId);
    // console.log(memberId);
    const url = `INSERT INTO heartlist( type, memberId, itemId) 
     VALUES (1,${memberId},${goodsId}) `;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
  });

router.delete('/goods_heart', (req, res) => {
    const memberId = req.body.memberId;
    const goodsId = req.body.goodsId;
    const url = `DELETE FROM heartlist
                  where itemId = ${goodsId}  
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
                where itemId = ${goodsId} 
                  and memberId = ${memberId}
                  and type = 1
                  `;
    db.query(url).then(([results]) => {
      // console.log(results)
        res.json({ data: results, results: 
        'success' });
    });
});



//加入購物車

router.post('/cartinsert', (req, res) => {
  console.log('DO /cartinsert')
    const memberId = req.body.memberId;
    const goodsId = req.body.goodsId;
    const name = req.body.name;
    const price = req.body.price;
    const goodsImgs = req.body.goodsImgs;
    // console.log(typeof userId);
    console.log("req.body:",req.body);
    const url = `INSERT INTO cartlist (memberId, goodsId, name, goodsImgs, price, quantity, createAt, orderId, isBuy, buyNow, orderState) 
     VALUES (${memberId},${goodsId},'${name}','${goodsImgs}',${price},1,NOW(),0,0,0,'') `;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
});

//購物車列表
router.get('/cartlist/get/:memberId', (req, res) => {
    const memberId = req.params.memberId;

    // console.log(typeof userId);
    // console.log(userId);
    
    const url = `SELECT cartlist.cartId, cartlist.goodsId, cartlist.memberId, cartlist.name, cartlist.goodsImgs, cartlist.price, cartlist.quantity, cartlist.createAt, cartlist.orderId, cartlist.isBuy, cartlist.buyNow, cartlist.orderState, memberlist.memberName, memberlist.mobile, memberlist.address FROM cartlist LEFT JOIN memberlist ON cartlist.memberId=memberlist.memberId WHERE cartlist.memberId=${memberId} and cartlist.isBuy=0 `;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
});
let orderIdOnCardUpdate=0
let result2=0
//按下購買 改變數量 buyNow 新增一筆訂單
router.post('/cartupdate', (req, res) => {
    console.log('req.body',req.body);
     const url = `INSERT INTO orderlist (memberId, totalPrice, memberName, address, mobile, orderState, productDelivery, paymentTerm ) 
     VALUES (${req.body.value[0].memberId}, ${0}, '${req.body.value[0].memberName}', '${req.body.value[0].address}', '${req.body.value[0].mobile}', '未出貨', '', '') `;
    db.query(url).then(([results]) => { 
      console.log('INSERT INTO orderlist', results)
        const url = `select orderId from orderlist order by createAt desc`;
       return db.query(url)
    }).then(([results]) => { 
      console.log('select orderId from orderlist',results)
        let id = "("+req.body.cartId.join(",")+")"
        const url = `update cartlist set orderId = ${results[0].orderId} where cartId in ${id}`;
        orderIdOnCardUpdate = results[0].orderId
       return db.query(url)
    }).then(([results]) => {
      console.log('update cartlist set orderId',results)
      // result2 = results
      for (let i = 0; i < req.body.value.length; i++ ){
        const url = `UPDATE cartlist SET buyNow=${1}, quantity=${req.body.value[i].quantity} WHERE cartId=${req.body.value[i].cartId}`;
        db.query(url)
      }
      return [results]
    }).then(([results]) => { 
      
      console.log('UPDATE cartlist SET buyNow=${1} results',results)

      console.log('UPDATE cartlist SET buyNow=${1} orderIdOnCardUpdate',orderIdOnCardUpdate)
      const url = `SELECT cartlist.orderId, cartlist.cartId, cartlist.goodsId, cartlist.memberId, cartlist.name, cartlist.goodsImgs, cartlist.price, cartlist.quantity, cartlist.createAt, cartlist.orderId, cartlist.isBuy, cartlist.buyNow, cartlist.orderState, memberlist.memberName, memberlist.mobile, memberlist.address FROM cartlist LEFT JOIN memberlist ON cartlist.memberId=memberlist.memberId WHERE cartlist.orderId=${orderIdOnCardUpdate} and cartlist.buyNow=1 `
      console.log("SQL :", url) 
      return db.query(url)
      // res.json({ data: result2, results: 'success' });

      }).then(([results]) => {
        console.log('SELECT cartlist.orderId, cartlist.cartId, cartlist.goodsId',results)
        res.json({ data: results, results: 'success' });
      });
      
    // res.json({data:'good job'});
});

//刪除購物車商品
router.delete('/cartlist', (req, res) => {
    const memberId = req.body.memberId;
    const cartId = req.body.cartId;
    const url = `DELETE FROM cartlist
                  where cartId = ${cartId}`;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
});
//刪除多個購物車商品
router.delete('/cartlists', (req, res) => {
    let id = "("+req.body.cartId.join(",")+")"
    const memberId = req.body.memberId;
    const cartId = req.body.cartId;
    const url = `DELETE FROM cartlist
                  where cartId in ${id}`;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
});

//按下購買 更新訂單資料(cartlist&orderlist) 數量 收件人 地址 電話 buyNow=2 isBuy=1
router.post('/orderupdate', (req, res) => {
    const orderId = req.body.orderId;
    const quantity = req.body.quantity;
    const memberName = req.body.memberName;
    const address = req.body.address;
    const mobile = req.body.mobile;
    const productDelivery = req.body.productDelivery;
    const paymentTerm = req.body.paymentTerm;
    const totalPrice = req.body.totalPrice;
    // console.log('req.body:',req.body);
    // console.log('req.body.orderId:',req.body.orderId);
    const url = `UPDATE orderlist SET memberName='${memberName}', address='${address}', mobile='${mobile}', productDelivery='${productDelivery}', paymentTerm='${paymentTerm}', totalPrice=${totalPrice}, createAt=NOW() WHERE orderId=${orderId}`;
    db.query(url).then(([results]) => {
      const url = `UPDATE cartlist SET quantity=${quantity}, buyNow=2, isBuy=1 WHERE orderId=${orderId}`;
      return db.query(url)
    }).then(([results]) => {
        res.json({ data: results, results: 'success' });
    }); 
});

//刪除購買頁面的商品 buyNow=0
router.post('/orderdelete', (req, res) => {
    // console.log('data',req.body.cartId);
    const url = `UPDATE cartlist SET buyNow=0 WHERE cartId=${req.body.cartId}`;
    // console.log("url : ",url)
    db.query(url).then(([results]) => {
        res.json({ data: results, results: 'success' });
    });
});

//購買頁面
router.post('/buy', (req, res) => {
    const orderId = req.body.orderId;
    const goodsId = req.body.goodsId;
    // console.log(typeof userId);
    // console.log(userId);
    const url = `SELECT cartlist.orderId, cartlist.cartId, cartlist.goodsId, cartlist.memberId, cartlist.name, cartlist.goodsImgs, cartlist.price, cartlist.quantity, cartlist.createAt, cartlist.orderId, cartlist.isBuy, cartlist.buyNow, cartlist.orderState, memberlist.memberName, memberlist.mobile, memberlist.address FROM cartlist LEFT JOIN memberlist ON cartlist.memberId=memberlist.memberId WHERE cartlist.orderId=${orderId} and cartlist.buyNow=1 `;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
});



//(某一筆)訂單
router.post('/order', (req, res) => {
    const orderId = req.body.orderId;
    // console.log(typeof userId);
    console.log("orderId:",orderId);
    const url = `SELECT orderlist.orderId, orderlist.memberId, cartlist.name, cartlist.goodsImgs, cartlist.quantity, orderlist.totalPrice, orderlist.createAt, orderlist.memberName, orderlist.address, orderlist.orderState, orderlist.productDelivery, orderlist.paymentTerm FROM orderlist JOIN cartlist ON orderlist.orderId=cartlist.orderId WHERE orderlist.orderId=${orderId} ;`;
    db.query(url).then(([results]) => {
      res.json({ data: results, results: 'success' });
    });
});

//訂單列表
router.post('/orderlist/asc', (req, res)=>{
    const memberId = req.body.memberId;
    const orderId = req.body.orderId;
    const url = `SELECT orderlist.orderId, orderlist.memberId, orderlist.memberName, orderlist.createAt, orderlist.totalPrice, orderlist.address, orderlist.orderState, orderlist.productDelivery, orderlist.paymentTerm, cartlist.cartId, cartlist.name, cartlist.goodsImgs, cartlist.quantity, cartlist.price
    FROM orderlist
    JOIN cartlist ON orderlist.orderId=cartlist.orderId
    WHERE orderlist.memberId=${memberId} and cartlist.isBuy=1 ORDER BY orderlist.createAt ASC`;//舊到新

    db.query(url).then(([results]) => {
        // console.log(results[0].orderId)
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
        // console.log(bigArr[2])
        res.json({ data: bigArr, results: 'success' });
      });
});

router.post('/orderlist/desc', (req, res)=>{
  const memberId = req.body.memberId;
  const orderId = req.body.orderId;
  const url = `SELECT orderlist.orderId, orderlist.memberId, orderlist.memberName, orderlist.createAt, orderlist.totalPrice, orderlist.address, orderlist.orderState, orderlist.productDelivery, orderlist.paymentTerm, cartlist.cartId, cartlist.name, cartlist.goodsImgs, cartlist.quantity, cartlist.price
  FROM orderlist
  JOIN cartlist ON orderlist.orderId=cartlist.orderId
  WHERE orderlist.memberId=${memberId} and cartlist.isBuy=1 ORDER BY orderlist.createAt DESC`;//新到舊

  db.query(url).then(([results]) => {
      // console.log(results[0].orderId)
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
      // console.log(bigArr[2])
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