const express = require('express');
// const { route } = require('./routeAdpotion');
const router = express.Router();
const app = express();
router.use('/adoption',require(__dirname +'/adoption/main.js'));
router.use('/cart',require(__dirname +'/cart/main.js'));
router.use('/homepage',require(__dirname +'/homepage/main.js'));
router.use('/membership',require(__dirname +'/membership/MemberApi.js'));
router.use('/social_media',require(__dirname +'/social_media/main.js'));
router.use('/store',require(__dirname +'/store/main.js'));
router.get('/', (req, res)=>{
    res.send('there is route master')
});

module.exports = router;

