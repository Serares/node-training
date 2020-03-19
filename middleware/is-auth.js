module.exports = (req,res,next) =>{
    //this middleware helps protect routs
    //in case a user that is not logged in types in browser ' /admin ' or ' /add-product'
    // the routs will simply not exist
    if(!req.session.isLoggedIn){
        return res.redirect('/login');
    }
    next();
}