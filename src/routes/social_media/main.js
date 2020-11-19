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

//有分類和主題的文章(Forum_all)
router.get('/get_forum_list/', (req, res) => {
  db.query(
    `SELECT a.* , b.des as petType ,c.des as issueType,d.memberName as memberName,d.memberPic as memberPic
     FROM forumarticle a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
     join taglist c on a.issueId = c.linkTypeId and c.typeId = 3
     join memberlist d on a.memberId = d.memberId
     WHERE 1 order by createAt DESC`
  ).then(([results]) => {
    results.forEach((e)=>{
      console.log(e)
      e.createAt=moment(e.createAt).format("YYYY-MM-DD HH:mm")
    })
    res.json(results);
  }).catch((e)=>{
    console.log(e)
    res.send(e);
  });
});


router.get('/get_forum_list/:articleId', (req, res) => {
  console.log(req.params);
  db.query(
    `SELECT a.* , b.des as petType ,c.des as issueType
     FROM forumarticle a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
     join taglist c on a.issueId = c.linkTypeId and c.typeId = 3
     WHERE a.talkId = ${req.params.articleId}`
  ).then(([results]) => {
    results.forEach((e)=>{
      console.log(e)
      e.createAt=moment(e.createAt).format("YYYY-MM-DD HH:mm")
    })
    res.json(results);
  })
});

//上傳文章
router.post('/forum_add', (req, res) => {
  const typeId = req.body.typeId;
  const issueId = req.body.issueId;
  // const memberId = req.body.memberId;
  const talkTitle = req.body.talkTitle;
  const talkContent = req.body.talkContent;
  const talkPic = req.body.talkPic;
  const createAt = new Date();
  const url =`INSERT INTO forumarticle(typeId, issueId, talkTitle, talkContent, talkPic,createAt) VALUES (${typeId},${issueId},${talkTitle},${talkContent},${talkPic},${createAt})`;
  db.query(url).then(([results]) => {
    res.json({ data: results, results: 'success' });
  });
});

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

//上傳文章圖片
router.post('/upload/addImage', function(req, res, next) {
  let form = new multiparty.Form();
  var path = require('path');
  form.uploadDir=path.resolve(__dirname,'../public/images');
  console.log(form.uploadDir);
  form.keepExtensions=true;
  form.autoFiels=true;
  form.parse(req,function(err,fields,files){
    if(err){
      res.json({
        status:"1",
        msg:"err"+err
      });
    }else{
      res.json({ 
        status:"0",
        msg:"success",
        personPicture: "http://localhost:3000"+files.file[0].path.split("public")[1]
      });
    }
  });  
});

//寫入留言- 第一種寫法
// router.post("/forumUserTalk", async (req, res) => {
//   const data = {
//     ...req.body
//   };
//   data.createAt = moment(new Date()).format(
//     "YYYY-MM-DD HH:mm");
//   const sql = "INSERT INTO  forumreply set ?";
//   const [{saveMessage}] = await db.query(sql, [data]);
//   res.json({
//       success: !!saveMessage,
//   });
// });

//寫入留言- 第二種寫法
router.post('/forumUserTalk', (req, res) => {
  const memberId = req.body.memberId;
  const content = req.body.content;
  const talkId = req.body.talkId;
  const url = `INSERT INTO forumreply(talkId,memberId,content) 
  VALUES (${talkId},${memberId},'${content}')`;
  console.log(url)
  db.query(url).then(([results]) => {
    res.json({ results, results: 'success' });
  });
  
});


// 留言頁面(拿到資料)
router.get("/get_forumUserTalkMessage", async (req, res) => {
  db.query(
    `SELECT * FROM forumreply WHERE 1 ORDER BY replyId DESC`
  ).then(([results]) => {
    results.forEach((e)=>{
      e.createAt=moment(e.createAt).format("YYYY-MM-DD HH:mm")
    })
    res.json(results);
  })
});

// 留言頁面(拿到資料)
router.get("/get_forumUserTalkMessage/:id", async (req, res) => {
  db.query(
    `SELECT a.* , d.memberName as memberName,d.memberPic as memberPic
     FROM forumreply a join memberlist d on a.memberId = d.memberId
     WHERE talkId = ${req.params.id} ORDER BY replyId DESC`
  ).then(([results]) => {
    results.forEach((e)=>{
      e.createAt=moment(e.createAt).format("YYYY-MM-DD HH:mm")
    })
    res.json(results);
  })
});

//發表新文章(論壇)
router.post('/addForumCard', (req, res) => {
  
  const typeId = req.body.petType;
  const issueId = req.body.issueType;
  const memberId = req.body.memberId;
  const talkTitle = req.body.talkTitle;
  const talkPic = req.body.talkPic;
  const talkContent = req.body.talkContent;
  const url = `INSERT INTO forumarticle(typeId,issueId,memberId,talkTitle,talkContent,talkPic) 
  VALUES (${typeId},${issueId},${memberId},'${talkTitle}','${talkContent}','${talkPic}')`;
  console.log(url)
  db.query(url).then(([results]) => {
    res.json({ results, results: 'success' });
  });
});
//論壇
// ---------------------------分類查詢---------------------------
//分類搜尋找全部
router.get('/forum/news/all', (req, res)=>{
    db.query(`SELECT a.talkTitle , b.des as petType ,c.des as issueType
    FROM forumarticle a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
    join taglist c on a.issueId = c.linkTypeId and c.typeId = 3
    ORDER BY createAt DESC limit 5`)
    .then(([results])=>{
        res.json(results);
    })    
});

//分類搜尋找全部
router.get('/forum/hot/all', (req, res)=>{
  db.query(`SELECT a.talkTitle , b.des as petType ,c.des as issueType
  FROM forumarticle a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
  join taglist c on a.issueId = c.linkTypeId and c.typeId = 3
  ORDER BY clicks DESC limit 5`)
  .then(([results])=>{
      res.json(results);
  })    
});

// //分類搜尋找貓
// router.get('/forum/news/cat', (req, res)=>{
//   db.query(`SELECT a.* , b.des as petType ,c.des as issueType
//   FROM forumarticle a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
//   join taglist c on a.issueId = c.linkTypeId and c.typeId = 3
//   WHERE a.typeId=2 ORDER BY createAt DESC`)
//   .then(([results])=>{
//       res.json(results);
//   })    
// });
// //分類搜尋找狗
// router.get('/forum/news/dog', (req, res)=>{
//   db.query(`SELECT a.* , b.des as petType ,c.des as issueType
//   FROM forumarticle a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
//   join taglist c on a.issueId = c.linkTypeId and c.typeId = 3
//   WHERE a.typeId=3 ORDER BY createAt DESC`)
//   .then(([results])=>{
//       res.json(results);
//   })    
// });



//get論壇熱門
router.get('/get_forum_hot/', (req, res) => {
  db.query(
    `SELECT a.* , b.des as petType ,c.des as issueType
     FROM forumarticle a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
     join taglist c on a.issueId = c.linkTypeId and c.typeId = 3
     WHERE 1 ORDER BY a.clicks DESC`
  ).then(([results]) => {
    results.forEach((e)=>{
      console.log(e)
      e.createAt=moment(e.createAt).format("YYYY-MM-DD");
      console.log("temp:",e.createAt)
      e.createAt = e.createAt.split('-')
      console.log("temp1:",e.createAt)
    })
    res.json(results);
  }).catch((e)=>{
    console.log(e)
    res.send(e);
  });
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

//沒連結收藏之前的取得文章細節(單篇)
// router.get('/get_article_list/:articleId', (req, res) => {
//   console.log(req.params);
//   db.query(
//     `SELECT a.* , b.des as issueType
//     FROM articlelist a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
//        WHERE a.articleId = ${req.params.articleId}`
//   ).then(([results]) => {
//     res.json(results);
//   });
// });

router.get('/get_article_list/:articleId', (req, res) => {
  db.query(
    `SELECT a.* , b.des as issueType
    FROM articlelist a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
       WHERE a.articleId = ${req.params.articleId}`
  ).then(([results]) => {
    let userId = 0;
      if (req.params.memberId !== undefined) {
        userId = req.params.memberId;
        return db.query(
          `SELECT a.* , b.des as issueType,c.memberId as heart 
          FROM articleList a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
          left JOIN heartList c on c.itemId = a.articleId and c.type = 2 and c.memberId = ${userId}
          WHERE a.articleId = ${req.params.articleId}`
        );
      }
      // let articleData = results;
      // articleData.heart > 0 ? true : false;
      res.json(results);
  });
});


//文章加入收藏
router.post('/article_heart', (req, res) => {
  const userId = req.body.userId;
  const articleId = req.body.articleId;
  const url = `INSERT INTO heartList( type, memberId, itemId) 
               VALUES (2,${userId},${articleId}) `;
  db.query(url).then(([results]) => {
   
   
    res.json({ data: results, results: 'success' });

  });
});

router.delete('/article_heart', (req, res) => {
  const userId = req.body.userId;
  const articleId = req.body.articleId;
  const url = `DELETE FROM heartList
                where itemId = ${articleId} 
                  and memberId = ${userId}
                  and type = 2
                  `;
  db.query(url).then(([results]) => {
    res.json({ data: results, results: 'success' });
  });
});

router.post('/article_heart_init', (req, res) => {
  const userId = req.body.userId;
  const articleId = req.body.articleId;
  const url = `select listId FROM heartList
                where itemId = ${articleId} 
                  and memberId = ${userId}
                  and type = 2`;
  db.query(url).then(([results]) => {
    res.json({ data: results, results: 'success' });
  });
});


//會員取得的文章資料
router.get('/get_article_list/m/:memberId?', (req, res) => {
  db.query(
    `SELECT a.* , b.des as issueType,c.memberId as heart
    FROM articlelist a join taglist b on a.typeId = b.linkTypeId and b.typeId = 2
    left JOIN heartList c on c.itemId = a.articleId and c.type = 2 and c.memberId = ${userId}
       WHERE a.articleId = ${req.params.articleId}`
  )
    .then(([results]) => {
      console.log(results);
    });
});


module.exports = router;










