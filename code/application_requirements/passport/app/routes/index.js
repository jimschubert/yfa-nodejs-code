exports.index = function(req, res){
  res.render('index', { title: 'Express', user: req.user });
};

exports.login = function(req, res){
    res.render('login');
};