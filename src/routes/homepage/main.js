const express = require('express');

const db = require(__dirname + '/../../db_connect2');
const router = express.Router();

router.get('/', (req, res)=>{
    res.send('routes_homepage')
});

//exapmle for get data from database
// router.get('/try-db', (req, res)=>{
//     db.query('SELECT * FROM address_book LIMIT 2')
//     .then(([results])=>{
//         res.json(results);
//     })
// });

router.post('/question',(req,res)=>{
    let insertValue=''
    let total = req.body.question.length
    for(i=0;i<total;i++){
        i !== (total-1) ? insertValue += `(-1,${req.body.question[i]}),` : insertValue += `(-1,${req.body.question[i]})`
    }
    db.query(`INSERT INTO userPreference(memberId, tagId) VALUES`+insertValue)
    res.json(req.body)
})



module.exports = router;






