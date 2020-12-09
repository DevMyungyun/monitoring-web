function session () {}

session.checkAuth = function (req,res,next) { 
  if(req.isAuthenticated()){
      return next();
  }
  res.redirect('/user/login');
}

session.checkNotAuth = function (req,res,next) {
  if(req.isAuthenticated()){
      return res.redirect('/main');
  }
  next();
}


module.exports= session