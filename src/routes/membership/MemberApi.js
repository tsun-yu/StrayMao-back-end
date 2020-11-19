const express = require('express');
const db = require(__dirname + '/../../db_connect2');
const moment = require("moment-timezone");
const jwt = require("jsonwebtoken");
const upload = require(__dirname + "/../../upload-img-module");
 
const router = express.Router();

router.get('/', (req, res)=>{
    res.send('routes_membership')
});

/**
 * 追蹤清單 
 * typeCode: 1:商品  2: 社群 3:寵物
 * memberId: 使用者
 * 
 * auther : Angel
 */
router.post("/getHeartList", async (req, res) => {
  console.log("給我追蹤列表啦!!!")

  const output = {success: false};
  const typeCode = req.body.typeCode;
  let sql = "";
  switch (typeCode){
    case "1":
      sql = "select s.goodsId , s.goodsImgs , s.name , s.price "
      + "from shopgoods s "
      + "where s.goodsId in (select itemId from heartlist a where a.`type` = 1 and a.memberId = ? order by createAt desc) ";
      break;
    case "2": 
      sql = 
      "select ar.articleId , ar.articleTitle , ar.author , ar.articleContent , ar.articlePic " 
      + "from articlelist ar "
      + "where ar.articleId in (select itemId from heartlist a where a.`type` = 2 and a.memberId = ? order by createAt desc) ";
      break;
    case "3": 
      sql = 
      "select p.petId , p.pic from petinfo p "
      + "where p.petId in (select itemId from heartlist a where a.`type` = 3 and a.memberId = ? order by createAt desc) ";
      break;
  }
  const [rs] = await db.query(sql, [
    req.body.memberId
  ]);
  console.log("RS:", rs);

  if (rs) {
    req.session.admin = rs[0];
    output.success = true;
    output.data = rs;
  }
  res.json(output);
});

//商品評價-商城版
// is deleted


//取得我的評價
router.post("/getMyCommemtList", async (req, res) => {
  console.log("get MyComment!!!!" , req.body.memberId)

  const output = {
    success: false,
  };
  const sql = 
    "select distinct a.cartId , a.orderId , a.goodsId , a.goodsImgs , c.name , d.memberId , d.memberName "
    + ",IFNULL((select e.comStars from commentlist e where e.orderId=a.orderId and e.goodsId=a.goodsId order by addDate desc limit 1), 0) as comStars "
    + ",IFNULL((select e.comDesc from commentlist e where e.orderId=a.orderId and e.goodsId=a.goodsId order by addDate desc limit 1), '') as comDesc "
    + ",IFNULL((select e.addDate from commentlist e where e.orderId=a.orderId and e.goodsId=a.goodsId order by addDate desc limit 1), '') as comDate "
    + "from cartlist a "
    + "join orderlist b on a.orderId = b.orderId "
    + "join shopgoods c on a.goodsId = c.goodsId "
    + "join memberlist d on a.memberId = d.memberId "
    + "where 1 "
    + "and b.orderState = 3 "
    + "and a.memberId = ? ";
  const [rs] = await db.query(sql, [req.body.memberId]);
  if (rs) {
    req.session.admin = rs[0];
    output.success = true;
    output.data = rs;
  }
  res.json(output);
});

//新增我的評價
router.post("/addMyCommemtList", upload.none(), async (req, res) => {
  let output = { success: false , msg: "" , data: [] };
  let obj = req.body;
  const rsObj = {
    success : false,
    msg: ''
  }
  const sql =
    "insert into commentlist "
    + "(orderId, goodsId, comStars, comDesc, addDate, addMemberId, modDate, modMemberId) "
    + "values "
    + "(?, ?, ?, ?, current_timestamp(), ?, current_timestamp(), ?);";

  db.query(sql, [
    obj.orderId,
    obj.goodsId,
    obj.comStars,
    obj.comDesc,
    obj.memberId,
    obj.memberId,
  ])
  .then(([result]) => {
    output.success = true;
    output.data = result;
    output.msg = result.info
    res.json(output)
  })
  .catch((error) => {
    output.msg = error;
    res.json(output);
  });
});

//更新單筆評價
router.post("/updMyCommemtList", upload.none(), async (req, res) => {
  let obj = req.body;
  const rsObj = {
    success : false,
    msg: ''
  }
 
  const sql =
    "update commentlist " 
    + "set comStars = ? , comDesc = ? , modMemberId = ? , modDate = current_timestamp() "
    + "where commentId = ? ";
  try{
    const [{ affectedRows, changedRows }] = await db.query(sql, [
      obj.comStars,
      obj.comDesc,
      obj.memberId,
      obj.commentId,
    ]);

    if(changedRows > 0){
      rsObj.success = true,
      rsObj.msg = "更新了" + changedRows + "筆資料";
    }
  }catch(error){
    rsObj.msg = error
  }

  res.json(rsObj);
});

//刪除評價
router.post("/delMyCommemtList", async (req, res) => {
  let output = { success: false , msg: "" , data: [] };
  let obj = req.body;
  const sql = "delete from commentlist where orderId = ? and goodsId = ? and addMemberId = ? ";
  db.query(sql, [
    obj.orderId,
    obj.goodsId,
    obj.memberId,
  ])
  .then(([result]) => {
    output.success = true;
    output.data = result;
    output.msg = result.info
    res.json(output)
  })
  .catch((error) => {
    output.msg = error;
    res.json(output);
  });
});


//會員註冊 Start
//會員註冊
router.post("/addMember", upload.none(), async (req, res) => {
  const rsObj = {
    success : false,
    msg: ''
  }
  let obj = req.body;
  const sql =
    "INSERT INTO `memberlist` "
    + "(`memberName`, `memberPic`, `password`, `birthday`, `telephone`, `mobile`, `email`, `address`, `createAt`) "
    + "VALUES "
    + "(?,?,SHA1(?),?,?,?,?,?, NOW() ) ";
  
  try{
    const [{ affectedRows, changedRows }] = await db.query(sql, [
      obj.memberName,
      obj.memberPic,
      obj.password,
      obj.birthday,
      obj.telephone,
      obj.mobile,
      obj.email,
      obj.address,
    ]);

    if(affectedRows > 0){
      rsObj.success = true,
      rsObj.msg = "新增了" + affectedRows + "筆資料";
    }
  }catch(error){
    rsObj.msg = error
  }
  res.json(rsObj);
});

//查詢會員資料 (then catch 寫法)
router.get("/member/get/:memberId", async (req, res) => {
  let output = { success: false , msg: "" , data: [] };
  const sql = "SELECT * FROM memberlist WHERE memberId = ? limit 1";
  
  db.query(sql, [req.params.memberId])
    .then(([result]) => {
      output.success = true;
      result[0].birthday = moment(result[0].birthday).format("YYYY-MM-DD");
      output.data = result;
      res.json(output)
    })
    .catch((error) => {
      output.msg = error;
      res.json(output);
    });

});

//修改會員資料
router.post("/member/edit", async (req, res) => {
  let output = { success: false , msg: "" , data: [] };
  const q = req.body;
  const sql = "update memberlist set memberName = ? , birthday = ? , telephone = ? , mobile = ? , address = ? "
            + "where memberId = ? and password = SHA1(?) ";
  db.query(sql, [
    q.memberName,
    q.birthday,
    q.telephone,
    q.mobile,
    q.address,
    q.memberId,
    q.password
    ])
    .then(([result]) => {
      output.success = true;
      output.data = result;
      res.json(output)
    })
    .catch((error) => {
      output.msg = error;
      res.json(output);
    });
});
//會員註冊 End


router.use((req, res, next) => {
  const whiteList = ["list", "login", "verify", "verify2"];

  let u = req.url.split("?")[0];
  u = u.split("/");
  //console.log(`memberList: ${u[1]}`);
  if (whiteList.includes(u[1])) {
    next();
  } else {
    next();
  }
});

router.get("/", (req, res) => {
  res.redirect("/straymao/membership/list");
});

router.get("/getLogin", (req, res) => {
  res.render("memberList/login");
});

router.post("/login", async (req, res) => {
  console.log("HI~");
  const output = {
    // body: req.body,
    success: false,
  };
  const sql =
    "SELECT `memberId`, `email`, `memberName` FROM `memberlist` WHERE email=? AND password=SHA1(?)";
  const [rs] = await db.query(sql, [req.body.account, req.body.password]);
  console.log("RS:", rs);

  if (rs.length) {
    req.session.memberlist = rs[0];
    output.success = true;
    output.token = jwt.sign({ ...rs[0] }, process.env.TOKEN_SECRET);
    output.data = rs[0];
  }
  res.json(output);
});

router.get("/logout", (req, res) => {
  delete req.session.admin;
  res.redirect("/member_list/list");
});

router.post("/verify", (req, res) => {
  // req.body.token
  jwt.verify(req.body.token, process.env.TOKEN_SECRET, function (
    error,
    payload
  ) {
    if (error) {
      res.json({ error: error });
    } else {
      res.json(payload);
    }
  });
});

router.get("/verify2", (req, res) => {
  res.json({
    bearer: req.bearer,
  });
});

async function getListData(req) {
  const output = {
    page: 0,
    perPage: 10,
    totalRows: 0,
    totalPages: 0,
    rows: [],
    pages: [],
  };

  const [[{ totalRows }]] = await db.query(
    "SELECT COUNT(1) totalRows FROM memberlist"
  );
  if (totalRows > 0) {
    let page = parseInt(req.query.page) || 1;
    output.totalRows = totalRows;
    output.totalPages = Math.ceil(totalRows / output.perPage);

    if (page < 1) {
      output.page = 1;
    } else if (page > output.totalPages) {
      output.page = output.totalPages;
    } else {
      output.page = page;
    }

    // 處理頁碼按鈕
    (function (page, totalPages, prevNum) {
      let pages = [];
      if (totalPages <= prevNum * 2 + 1) {
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        const fAr = [],
          bAr = [];
        // 從前面開始數
        for (let i = page - prevNum; i <= totalPages; i++) {
          if (i >= 1) {
            fAr.push(i);
          }
          if (fAr.length >= prevNum * 2 + 1) break;
        }
        // 從後面開始數
        for (let i = page + prevNum; i >= 1; i--) {
          if (i <= totalPages) {
            bAr.unshift(i);
          }
          if (bAr.length >= prevNum * 2 + 1) break;
        }
        pages = fAr.length > bAr.length ? fAr : bAr;
      }
      output.pages = pages;
    })(page, output.totalPages, 3);

    // 處理頁碼按鈕 2
    (function (page, totalPages, prevNum) {
      let beginPage, endPage;
      if (totalPages <= prevNum * 2 + 1) {
        beginPage = 1;
        endPage = totalPages;
      } else if (page - 1 < prevNum) {
        beginPage = 1;
        endPage = prevNum * 2 + 1;
      } else if (totalPages - page < prevNum) {
        beginPage = totalPages - (prevNum * 2 + 1);
        endPage = totalPages;
      } else {
        beginPage = page - prevNum;
        endPage = page + prevNum;
      }
      output.beginPage = beginPage;
      output.endPage = endPage;
    })(page, output.totalPages, 3);

    let sql = `SELECT * FROM memberlist ORDER BY memberId DESC LIMIT ${
      (output.page - 1) * output.perPage
    }, ${output.perPage}`;

    const [r2] = await db.query(sql);
    r2.forEach((el) => {
      el.birthday = moment(el.birthday).format("YYYY-MM-DD");
    });
    output.rows = r2;
  }

  return output;
}

/* RESTful API
    列表
    /api/ GET

    新增
    /api/ POST

    呈現單筆
    /api/:smemberId GET

    修改單筆
    /api/:memberId PUT

    刪除單筆
    /api/:memberId DELETE
*/

router.get("/api", async (req, res) => {
  res.json(await getListData(req));
});

router.get("/list", async (req, res) => {
  const output = await getListData(req);
  console.log(output);
  // res.render('memberList/list', output);
  if (req.session.admin) {
    res.render("memberList/list", output);
  } else {
    res.render("memberList/list-noadmin", output);
  }
});

router.get("/addget", (req, res) => {
  res.render("memberList/add");
});

//要有這個midleware才能處理form-data的資料
// router.post('/add', upload.none(), (req, res)=>{
//     res.json(req.body);
// });

router.get("/edit/:memberId", async (req, res) => {
  const sql = "SELECT * FROM memberlist WHERE memberId=?";

  const [results] = await db.query(sql, [req.params.memberId]);
  if (!results.length) {
    return res.redirect("/member_list/list");
  }

  results[0].birthday = moment(results[0].birthday).format("YYYY-MM-DD");
  res.render("member_list/edit", results[0]);
});

router.post("/edit/:memberId", upload.none(), async (req, res) => {
  const data = { ...req.body };
  const sql = "UPDATE `memberlist` SET ? WHERE `memberId`=?";
  // const [results] = await db.query(sql, [ data, req.params.memberId ]);
  const [{ affectedRows, changedRows }] = await db.query(sql, [
    data,
    req.params.memberId,
  ]);
  // {"fieldCount":0,"affectedRows":1,"insertId":0,"info":"Rows matched: 1  Changed: 0  Warnings: 0","serverStatus":2,"warningStatus":0,"changedRows":0}
  //  res.json(results);
  res.json({
    success: !!changedRows,
    affectedRows,
    changedRows,
  });
});

router.delete("/del/:memberId", async (req, res) => {
  const sql = "DELETE FROM `memberlist` WHERE memberId=?";
  const [results] = await db.query(sql, [req.params.memberId]);

  res.json(results);
});

/*
    列表  /list
        列表呈現 GET

    新增  /add
        表單呈現 GET, 接收資料 POST

    修改  /edit/:memberId
        修改的表單呈現 GET, 接收資料 POST

    刪除  /del/:memberId
        DELETE
*/

module.exports = router;










