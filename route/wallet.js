const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { saitize } = require('express-validator/filter');
const user = require('../models/dog.js');
const route = express.Router();

//Access Control
let loggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    } else {
        req.flash('danger', "Youn need to log In");
        res.redirect('/users/login');
    }
};

route.post('/add_money/:id', loggedIn, (req, res) => {
    user.findById(req.params.id, (err,f) => {
    if (req.user._id == f.id) {
        user.findByIdAndUpdate(req.params.id, {$inc:{total: req.body.addm}}, {upsert:true}, (err) => {
            if (err) {
                console.log(err);
            } else {
            res.redirect('/users/user/'+req.params.id) 
            }
        });
    } else {
        res.write('<p>you first have to <a href="/users/login"><button>LOG IN</button></a></p>');
        res.end();
    }
    })
});
route.post('/send_money/:id', loggedIn, [
    check('sendm').custom((value, {req}) =>{
        if (value <= req.user.total) {
            return true;     
        } else {
            throw new Error ('Value should be less than your wallet value'); 
        }
    })
],  (req,res) => {
    user.findById(req.params.id, (err,f) => {
        if (req.user._id != f.id) {
            res.write('<p>you first have to <a href="/users/login"><button>LOG IN</button></a></p>');
            res.end();
    } else {
        const errors = validationResult(req);
    if (!errors.isEmpty()) {
        user.findById(req.params.id, (err,f) => {
            if (err) {
                console.log(err);
            } else {
                res.render('user', {
                    tittle:'Error', 
                    message:'Error sending', 
                    user:f,
                    errors:errors.mapped()});
            }
        })
        
    } else {
        user.findByIdAndUpdate(req.params.id, {$inc:{total: -req.body.sendm}}, {upsert:true}, (err) => {
            if (err) {
                console.log(err);
            } else {
            res.redirect('/users/user/'+req.params.id) 
            }
        });
    }
        
    }
    })
});

module.exports = route;