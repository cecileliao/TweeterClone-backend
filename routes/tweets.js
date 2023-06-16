var express = require('express');
var router = express.Router();

require('../models/connection');

const Tweet = require('../models/tweets');
const User = require('../models/users');
const Trend = require('../models/trends');

// Get all tweets
router.get('/', (req, res)=> {
    console.log("get All")

    Tweet.find()
    .populate('author')
    .sort({_id: -1})
    .then(data => {
        // vérifier que data retourne pas ttes les données user comme mdp
        console.log("saved ", data)
        let tweets = []
        for(let x=0; x<data.length; x++) {
            console.log("test", data[x].author.firstname);
            let isLiked = false;
            if(data[x].likers.length>0 && data[x].likers.includes(data[x].author._id)) {
                isLiked = true;
            }
            tweets.push( {
                id: data[x]._id,
                tweet: data[x].tweet,
                date: data[x].date,
                like: data[x].likers.length,
                isLiked: isLiked,
                authorFirstname: data[x].author.firstname,
                authorUsername: data[x].author.username,
                authorAvatar: data[x].author.avatar,
            })
        }
        res.json({data: tweets})
    })
  }
)

// Post msg
router.post("/", (req, res) => {
    let tweet = req.body.tweet.trim().substring(0, 280);
    let token = req.body.token.trim();
    if( tweet!="" && token!="" ) {
        
        User.findOne({token: token})
        .then(data => {
            //console.log("saved ", data)
            if(data && data.id) {
                new Tweet({
                    author: data._id,
                    tweet: tweet,
                   }).save().then(() => {
                        console.log("saved ", tweet)

                        // Add to hashtag trends default count 1
                        let hashtags = tweet.match(/(?:\s|^)#[^\s]+/g)
                        console.log("regex", hashtags)
                        if(hashtags!=null) {
                            for(let i=0; i<hashtags.length; i++) {

                                Trend.findOne({hashtag: hashtags[i]})
                                .then(test => {
                                    if(test) {
                                        console.log("hashatg exist", hashtags[i])
                                        Trend.updateOne(
                                            {hashtag: hashtags[i]},
                                            { $inc: {count :  +1}}
                                        )
                                        .then()

                                    } else {
                                        new Trend({
                                            hashtag: hashtags[i]
                                        }).save().then(() => {
                                
                                        });
                                    }
                                })
                            }
                        }
                        
                        res.json({result: true})
                        return;
                });
            }
        })
        
    } else {
        res.json({result: false})
    }
})

// delete tweet
router.post("/del", (req, res) => {

    User.findOne({token: req.body.token})
        .then(data => {
            //console.log("user finded ", data)
            if(data && data.id) {
                Tweet.deleteOne({
                    _id: req.body.id,
                    author: data.id
                })
                .then(data => {
                    console.log("deleted", data)
                    res.json({result: true})
                })
                .catch((error) => {
                    res.json({result: false})
                })
            } else {
                res.json({result: false})
            }
        })
})

// like
router.post('/like', (req, res)=> {

    if(req.body.id) {

        User.findOne({token: req.body.token})
        .then(data => {
            if(data && data.id) {

                Tweet.findOne({_id: req.body.id, likers: {$in: data.id}})
                .then(tw=> {
                    if(tw) {
                        console.log("Already like")
                        Tweet.updateOne(
                            { _id: req.body.id },
                            { $pull : {likers: data.id} }
                            ).then(() => {
                                
                            });
                    }else {
                        console.log("Not like yet")
                        Tweet.updateOne(
                            { _id: req.body.id },
                            { $push : {likers: data.id} }
                            ).then(() => {
                                
                            });
                    }
                })
                res.json({result: true})
                /*Tweet.updateOne(
                    { _id: req.body.id },
                    { $push : {likers: data.id} }
                    ).then(() => {
                        res.json({result: true})
                    });*/
            }
        })

    } else {
        res.json({result: false})
    }
})

// dislike
router.post('/dislike', (req, res)=> {
    if(req.body.id) {

        User.findOne({token: req.body.token})
        .then(data => {
            if(data && data.id) {
                Tweet.updateOne(
                    { _id: req.body.id },
                    { $pull : {likers: data.id} }
                    ).then(() => {
                        res.json({result: true})
                    });
            }
        })

    } else {
        res.json({result: false})
    }
})

// getTrends
router.get('/trends', (req, res)=> {
    Trend.find()
    .sort({count: -1})
    .then(data => {
        if(data)
            res.json({result: true, data: data})
        else
            res.json({result: false})
     })
})

module.exports = router;