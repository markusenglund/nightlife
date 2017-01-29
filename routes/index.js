const express = require('express');
const router = express.Router();
const passport = require('passport');
const yelp = require('yelp-fusion');
const secrets = require('../secrets')
const YELP_ACCESS_TOKEN = secrets.yelpToken

const Bar = require("../models/bar")


/* GET home page. */
router.get('/auth/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/login'
}))
router.get('/auth/twitter', passport.authenticate('twitter'))

router.get('/yelp/write', (req, res) => {
    if (!req.user) {
        return res.send(false) //This is the shittiest workaround of all time
    }
    let yelpId = req.query.id
    let userId = req.user._id.toString()
    Bar.findOne({ id: yelpId }, (err, bar) => {
        console.log("bar.findone " + yelpId)      
        if (err) {
            console.log(err)
            res.error(err)
        }
        if (bar) {
            console.log("bar exists in db")
            if (bar.isGoing.includes(userId)) {
                console.log("req.user is in bar")
                Bar.findOneAndUpdate(
                    { id: yelpId }, { $pull: { isGoing: userId } }, { new: true }, (err, bar) => {
                        res.json(bar) //LOOKS LIKE ITS WORKING!
                    })
                
            } else {
                console.log("bar does not have req.user")
                console.log(req.user)
                bar.isGoing.push(req.user._id)
                bar.save(() => {
                    res.json(bar)                    
                })
            }
        }
        if (!bar) {
            console.log("bar did not exist in db")
            const newBar = new Bar({
                id: yelpId,
                isGoing: [req.user._id]
            })
            newBar.save(err => {
                if (err) {
                    return err
                }
                console.log(newBar)
                Bar.find((err, bars) => { //This isn't necessary remove later
                    console.log("console.log(bars):")
                    //console.log(bars)
                    res.json(newBar)
                })
            })
        }

    })  
})

router.get('/yelp', (req, res) => { //There seem to be a weird delayed error stemming from here
    const client = yelp.client(YELP_ACCESS_TOKEN)
    client.search({
        location: req.query.location
    }).then(response => {
        let bars = response.jsonBody.businesses
        let itemsProcessed = 0
        bars.forEach( obj => {
            Bar.findOne({ id: obj.id },  (err, bar) => {
                if (bar) {
                    console.log("bar found: " + bar.id)
                    obj.isGoing = bar.isGoing //confusing variable names
                } else {
                    obj.isGoing = []
                }
                itemsProcessed++
                if (itemsProcessed === bars.length) {
                    callback()
                }
            })
        })
        function callback() {
            console.log("callbackfcn called")
            res.json(bars)
        }        
    }).catch(e => {
        console.log("Nånting gick fel!")
        res.error(e)
    });
})

router.get('/', function(req, res, next) {
  console.log(req.user)
  console.log(req.isAuthenticated());
  res.render('index', { user: req.user });
});

module.exports = router;
