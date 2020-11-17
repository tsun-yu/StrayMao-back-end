const express = require('express');
const jwt = require('jsonwebtoken');
const db = require(__dirname + '/../../db_connect2');
const router = express.Router();
const upload = require(__dirname + '/../../upload-img-module');



router.get('/', (req, res)=>{
    res.send('routes_store嗨嗨，商店喔')
});

//exapmle for get data from database
//get最新商品
router.get('/goods/news', (req, res)=>{
    // db.query('SELECT * FROM shopgoods LIMIT 2')
    db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1 ORDER BY `shopgoods`.`goodsId` DESC')
    // db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1 ORDER BY `shopgoods`.`goodsId` ASC')
    .then(([results])=>{
        res.json({ data: results, results: 'success' });
    })    
});

//get熱門商品
router.get('/goods/sale', (req, res)=>{
    // db.query('SELECT * FROM shopgoods LIMIT 2')
    db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1 ORDER BY `shopgoods`.`sale` DESC')
    // db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1 ORDER BY `shopgoods`.`goodsId` ASC')
    .then(([results])=>{
        res.json({ data: results, results: 'success' });
    })    
});

//get特價商品
router.get('/goods/discount', (req, res)=>{
    // db.query('SELECT * FROM shopgoods LIMIT 2')
    db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE discount<1')
    // db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1 ORDER BY `shopgoods`.`goodsId` ASC')
    .then(([results])=>{
        res.json({ data: results, results: 'success' });
    })    
});

//get狗商品
router.get('/goods/dog', (req, res)=>{
    // db.query('SELECT * FROM shopgoods LIMIT 2')
    db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE categoryId=5 OR categoryId=6')
    // db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1 ORDER BY `shopgoods`.`goodsId` ASC')
    .then(([results])=>{
        res.json({ data: results, results: 'success' });
    })    
});

//get貓商品
router.get('/goods/cat', (req, res)=>{
    // db.query('SELECT * FROM shopgoods LIMIT 2')
    db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE categoryId=7 OR categoryId=8')
    // db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1 ORDER BY `shopgoods`.`goodsId` ASC')
    .then(([results])=>{
        res.json({ data: results, results: 'success' });
    })    
});

//get價格高到低
router.get('/goods/priceU', (req, res)=>{
    // db.query('SELECT * FROM shopgoods LIMIT 2')
    db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1 ORDER BY `shopgoods`.`price` DESC')
    // db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1 ORDER BY `shopgoods`.`goodsId` ASC')
    .then(([results])=>{
        res.json({ data: results, results: 'success' });
    }) 
});

//get價格低到高
router.get('/goods/priceD', (req, res)=>{
    // db.query('SELECT * FROM shopgoods LIMIT 2')
    db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1 ORDER BY `shopgoods`.`price` ASC')
    // db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1 ORDER BY `shopgoods`.`goodsId` ASC')
    .then(([results])=>{
        res.json({ data: results, results: 'success' });
    })    
});

//get商品詳細資訊
router.get('/goods', (req, res)=>{
    // db.query('SELECT * FROM shopgoods LIMIT 2')
    db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1 ORDER BY `shopgoods`.`goodsId` DESC')
    // db.query('SELECT goodsId, goodsImgs, name, categoryId, pricing, price, sale, createAt, shelfStatus, createAt FROM shopgoods WHERE 1 ORDER BY `shopgoods`.`goodsId` ASC')
    .then(([results])=>{
        res.json({ data: results, results: 'success' });
    })
    
});

//post商品詳細資訊
router.post('/goods', upload.array('goodsImgs'), async (req, res)=>{
    const goodsImgsArray = req.files.map(f => f.filename);
    const data = {...req.body};
    data.goodsImgs = JSON.stringify(goodsImgsArray);
    data.createAt = new Date();
    const sql = "INSERT INTO `shopgoods` set ?";
    const [{affectedRows, insertId}] = await db.query(sql, [ data ]);
    // [{"fieldCount":0,"affectedRows":1,"insertId":860,"info":"","serverStatus":2,"warningStatus":1},null]

    res.json({
        success: !!affectedRows,
        affectedRows,
        insertId,
        file: data.goodsImgs,
    });
});


//評價get
router.get('/goods/evaluation', (req, res)=>{
    // db.query('SELECT * FROM shopgoods LIMIT 2')
    db.query('SELECT goodsEvaluationId, goodsEvaluationMemberId, goodsEvaluationMemberName, goodsEvaluation, goodsStarts, goodsEvaluationCreateAt FROM goodsevaluation WHERE 1 ORDER BY `goodsevaluation`.`goodsEvaluationId` DESC')
    .then(([results])=>{
        res.json({ data: results, results: 'success' });
    })
});

// 商品Id
router.get('/goods/:goodsId', (req, res) => {
    console.log(req.params);
    db.query(
      `SELECT a.* ,c.des tag,
      replace(a.goodsDescription , '\n' , '<br>') newDesc
      FROM shopgoods a join tagList c on a.categoryId = c.typeId
      WHERE a.goodsId = ${req.params.goodsId}`
     ).then(([results])=>{
        res.json({ data: results, results: 'success' });
    })
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










