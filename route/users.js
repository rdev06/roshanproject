const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { saitize } = require('express-validator/filter');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const user = require('../models/dog.js');
const route = express.Router();


//  Access Control
let loggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', "Youn need to log In");
        res.redirect('/users/login');
    }
};

// USERS

route.get('/',(req,res) => {
    user.find({}, (err,lusers) => {
        if (err) {
            console.log(err);
        } else {
            res.render('users', {tittle:'users', message:'List of Users', users:lusers})
        }
    })
    });

    // ADDING USERS
    
route.get('/add',(req,res) => {
    res.render('add_user', {tittle:'Add user', message:'Fill in Form to Add user'}
    )});

    //INPUT DATA TO USERS

route.post('/add',[
    check('name').not().isEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Email.is required'),
    check('password')
    .isLength({min:5}).withMessage('Password should be of atleast five character')
    .matches(/\d/).withMessage('Password should contain alfhabet and numbers'),
    check('rpassword').custom((value,{req}) => {
        if (value!=req.body.password) {
            throw new Error ('Password does not match');
        } else {
            return true;
        }
    }),
    check ('phone').not().isEmpty().withMessage('Phone number is required')
    .isLength({min:10, max:10}).withMessage('Please enter a valid phone number of 10 digit')
] , (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('add_user', {
            tittle:'Error Adding', 
            message:'Please check in your input correctly', 
            errors:errors.mapped()});
    } else {
        let u = new user();
        u.name = req.body.name;
        u.email = req.body.email;
        u.password = req.body.password;
        u.phone = req.body.phone;

        //using bcrypt

        bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                console.log(err);
            } else {
                bcrypt.hash(u.password, salt, (err, hash) => {
                    if (err) {
                        console.log(err);
                    } else {
                        u.password = hash;
                        u.save((err) => {
                            if (err) {
                                console.log(err);
                                
                            } else {
                                req.flash("success", "You get registered and now you can LOGIN");
                                res.redirect('/users')
                            }
                        })
                    }
                })
            }
        })

        }
});

// HANDLING PER USER DATA

route.get('/user/:id',loggedIn, (req, res) => {
    user.findById(req.params.id, (err,f) => {
        if (req.user._id != f.id) {
            req.flash('danger', "Youn need to log In");
            res.redirect('/users/login');
        } else {
            if (err) {
                console.log(err);
            } else {
                res.render('user', {tittle:'User data', message:'Fetched user data', user:f});
            }
        }
    })   
});

//  EDITING
route.get('/user/edit/:id', loggedIn, (req, res) => {
    user.findById(req.params.id, (err,f) => {
        if (req.user._id != f.id) {
            req.flash('danger', "Youn need to log In");
        res.redirect('/users/login');
        } else {
            if (err) {
                console.log(err);
            } else {
                res.render('edit_user', {tittle:'edit data', message:'carefully edit user data', user:f})
        }}
    })
});

//  HANDLING POST REQUEST OF EDITTING

route.post('/edit/:id', loggedIn, [
    check('name').not().isEmpty().withMessage('Name is required'),
    check('email').isEmail().withMessage('Email.is required'),
    check('password')
    .isLength({min:5}).withMessage('Password should be of atleast five character')
    .matches(/\d/).withMessage('Password should contain alfhabet and numbers'),
    check('rpassword').custom((value,{req}) => {
        if (value!=req.body.password) {
            throw new Error ('Password does not match');
        } else {
            return true;
        }
    }),
    check ('phone').not().isEmpty().withMessage('Phone number is required')
    .isLength({min:10, max:10}).withMessage('Please enter a valid phone number of 10 digit')
] , (req,res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        user.findById(req.params.id, (err,f) => {
            if (err) {
                console.log(err);
            } else {
                res.render('edit_user', {tittle:'edit data', 
                message:'carefully edit user data', user:f, errors:errors.mapped()})
            }
        })
    } else {
        user.findById(req.params.id, (err,f) => {
            if (req.user._id != f.id) {
                req.flash('danger', "Youn need to log In");
            res.redirect('/users/login');
            } else {
                if (err) {
                    console.log(err);
                } else {
                    let u = {};
        u.name = req.body.name;
        u.email = req.body.email;
        u.password = req.body.password;
        u.phone = req.body.phone;

        user.findOneAndUpdate(req.params.id, u, (err) =>{
            if (err) {
                console.log(err);
            } else {
                res.redirect('/users');
            }
        })
            }}
        })   
    }
});

//  DELETING

route.get('/user/delete/:id', loggedIn, (req, res) => {
    user.findById(req.params.id, (err,f) => {
        if (req.user._id != f.id) {
            req.flash('danger', "Youn need to log In");
        res.redirect('/users/login');
        } else {
            if (err) {
                console.log(err);
            } else {
                user.findOneAndDelete(req.params.id, (err,f) => {
                    if (err) {
                        console.log(err);
                    } else {
                        res.redirect('/users');
                    }
                })
            }
        }
    })
});

//  LOGIN

route.get('/login', (req, res) => {
    res.render('login', {tittle:'Enter using Email Id and Password', message:'Please do not share your credencials'})
})

//  HANDLIND LOGIN POST REQUEST
route.post('/login', passport.authenticate('local', {
    //successRedirect:'/users/',
    failureRedirect:'/users/login',
    failureFlash:true
}),
   (req,res) => {
    res.redirect('/users/user/' + req.user._id);
   } 
)

// HANDLING LOGOUT REQUEST

route.get('/logout', (req,res) => {
    req.logOut();
    req.flash('success', "you are successfully logged Out");
    res.redirect('/users/login')
})

module.exports = route;
