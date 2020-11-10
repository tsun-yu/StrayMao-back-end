const express = require('express');
const moment = require('moment-timezone');
const db = require(__dirname + '/../../db_connect2');
const upload = require(__dirname + '/../../upload-img-module');

const router = express.Router();

router.get('/', (req, res)=>{
    res.send('routes_social_media')
});

//exapmle for get data from database
router.get('/try-db', (req, res)=>{
    db.query('SELECT * FROM address_book LIMIT 2')
    .then(([results])=>{
        res.json(results);
    })
});


//有分類和主題的文章(all)
router.get('/get_forum_list/', (req, res) => {
  db.query(
    `SELECT a.* , b.des as petType ,c.des as issueType
     FROM forumarticle a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
     join taglist c on a.issueId = c.linkTypeId and c.typeId = 3
     WHERE 1`
  ).then(([results]) => {
    
    res.json(results);
  });
});

//論壇
// ---------------------------分類查詢---------------------------
//分類搜尋找全部
router.get('/forum/news/all', (req, res)=>{
    db.query(`SELECT a.* , b.des as petType ,c.des as issueType
    FROM forumarticle a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
    join taglist c on a.issueId = c.linkTypeId and c.typeId = 3
    WHERE a.typeId=1 ORDER BY createAt DESC`)
    .then(([results])=>{
        res.json(results);
    })    
});
//分類搜尋找貓
router.get('/forum/news/cat', (req, res)=>{
  db.query(`SELECT a.* , b.des as petType ,c.des as issueType
  FROM forumarticle a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
  join taglist c on a.issueId = c.linkTypeId and c.typeId = 3
  WHERE a.typeId=2 ORDER BY createAt DESC`)
  .then(([results])=>{
      res.json(results);
  })    
});
//分類搜尋找狗
router.get('/forum/news/dog', (req, res)=>{
  db.query(`SELECT a.* , b.des as petType ,c.des as issueType
  FROM forumarticle a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
  join taglist c on a.issueId = c.linkTypeId and c.typeId = 3
  WHERE a.typeId=3 ORDER BY createAt DESC`)
  .then(([results])=>{
      res.json(results);
  })    
});



//get論壇熱門
router.get('/forum/hot', (req, res)=>{
    db.query('SELECT `talkId`, `typeId`, `issueId`, `memberId`, `talkTitle`, `talkContent`, `talkPic`, `clicks`, `createAt` FROM `forumarticle` WHERE 1 ORDER BY `forumarticle`.`clicks` DESC')
    .then(([results])=>{
        res.json(results)
    })
});




// 編輯論壇 PI
router.post('/edit/:sid', upload.none(), async (req, res) => {
    const data = {
      ...req.body
    };
    data.last_edit_time = moment(new Date()).format(
      "YYYY-MM-DD");
    const sql = "UPDATE `w_product_mainlist` SET ? WHERE `sid`=?";
    const [{
      affectedRows,
      changedRows
    }] = await db.query(sql, [data, req.params.sid]);
  
    //  {"fieldCount":0,"affectedRows":1,"insertId":0,"info":"Rows matched: 1  Changed: 0  Warnings: 0","serverStatus":2,"warningStatus":0,"changedRows":0}
  
    res.json({
      success: !!changedRows,
      affectedRows,
      changedRows,
    });
  });


//post 論壇文章-圖片
router.post('/forum', upload.array('forumImgs'), async (req, res)=>{
    const forumImgsArray = req.files.map(f => f.filename);
    const data = {...req.body};
    data.forumImgs = JSON.stringify(forumImgsArray);
    data.createAt = new Date();
    const sql = "INSERT INTO `forumarticle` set ?";
    const [{affectedRows, insertId}] = await db.query(sql, [ data ]);
    // [{"fieldCount":0,"affectedRows":1,"insertId":860,"info":"","serverStatus":2,"warningStatus":1},null]

    res.json({
        success: !!affectedRows,
        affectedRows,
        insertId,
        file: data.forumImgs,
    });
});


//文章
//有分類和主題的文章(all)
router.get('/get_article_list/', (req, res) => {
  db.query(
    `SELECT a.* , b.des as issueType
     FROM articlelist a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
     WHERE 1`
  ).then(([results]) => {
    
    res.json(results);
  });
});


module.exports = router;










