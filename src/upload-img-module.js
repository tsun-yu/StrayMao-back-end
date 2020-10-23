const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

const extMap = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/gif': '.gif',
};

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, __dirname + '/../public/img')
    },
    filename: function(req, file, cb){
        const ext = extMap[file.mimetype];
        if(ext){
            cb(null, uuidv4() + ext);
        } else {
            cb(new Error('...'));
        }
    },
});

const fileFilter = function(req, file, cb){
    cb(null, !! extMap[file.mimetype]);
};

module.exports = multer({
    storage,
    fileFilter,
});
