var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
    const user = req.user;
    if (!user){
        req.flash('error', 'To get ChatUp you Have to login First');
        res.redirect('/sessions');
    }
    console.log('bug')
    res.render('ToDoList/coomingSoon', { user: user });
});

module.exports = router;