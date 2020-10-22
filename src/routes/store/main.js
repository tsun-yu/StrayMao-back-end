const express = require('express');

const db = require(__dirname + '/../../db_connect2');
const router = express.Router();

router.get('/', (req, res)=>{
    res.send('routes_store嗨嗨，商店喔')
});

//exapmle for get data from database
router.get('/try-db', (req, res)=>{
    db.query('SELECT * FROM shopgoods LIMIT 2')
    .then(([results])=>{
        res.json(results);
    })
});
module.exports = router;










