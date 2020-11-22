var express = require('express');
const { mountpath } = require('../app');
var router = express.Router();

router.get('/', function(req, res, next) {
    console.log('bug')
    res.render('ToDoList/coomingSoon', {});
});

module.exports = router;