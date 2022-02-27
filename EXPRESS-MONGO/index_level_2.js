// ============================================
// ============== 1. S E T  U P ===============
// ============================================

// ******************************
// ASSIGN "require" TO VARIABLES
// ******************************
const express = require('express');
const hbs = require('hbs');
const waxOn = require('wax-on');
const MongoUtil = require("./MongoUtil.js");
// const axios = require('axios');
var ObjectId = require('mongodb').ObjectId;
const helpers = require('handlebars-helpers')(
    {
        'handlebars': hbs.handlebars
    }
);
const dotenv = require('dotenv');
const { Collection } = require('mongodb');
dotenv.config();

async function main() {
    // ******************************
    // SET UP THE REQUIREMENTS 
    // ******************************

    // 1A. SETUP EXPRESS application
    let app = express();

    // 1B. SETUP VIEW ENGINE
    app.set('view engine', 'hbs');

    // 1C. SETUP STATIC FOLDER
    app.use(express.static('public'));
    // set up static file for images, css
    // in this case, we set up to link to /public folder

    // 1D. SETUP WAX ON (FOR TEMPLATE INHERITANCE)
    waxOn.on(hbs.handlebars);
    waxOn.setLayoutPath('./views/layouts'); // set up templates inheritance path

    // 1E. ENABLE FORMS
    app.use(express.urlencoded({ extended: false }));

    // 1F. Connect to Mongo
    await MongoUtil.connect(process.env.MONGO_URI, process.env.DBNAME);
    let db = MongoUtil.getDB();

// ============================================
// ============== 2. R O U T E S ==============
// ============================================

    // ******************************************************
    // READ ROUTE - LOAD IN FROM MONGODB AND RENDER TO FRONTEND 
    // ******************************************************
    app.get('/', async (req,res)=>{

        // Load in from MongoDB
        let data = await db.collection( process.env.COLLECTION ).find().toArray();

        // pass the data to hbs
        res.render('index.hbs', {
            'data' : data
        });

    })
    // ******************************************************
    // CREATE ROUTE 
    // ******************************************************
    
    // .get - to send to the frontend and show the form
    app.get('/create',  (req,res)=>{
        res.render('create.hbs');
    })
    // .post - route for the form to submit in
    app.post('/create', (req,res)=>{

        // retrieve the form details from the body object
        let username = req.body.username;

        // Skip this step and insert data in directly
        // let newData = {
        //     username : username
        // }

        // save to MONGODB
        db.collection( process.env.COLLECTION ).insertOne( 
            {
                'username'  :   username
            }
         )

        // redirect route to root
        res.redirect('/');
    })
    // ******************************************************
    // UPDATE ROUTE 
    // ******************************************************
    
    // .get route 
    app.get('/:taskId/update', async (req,res)=>{

        // retrieve the taskId from the params object
        let taskId = req.params.taskId;

        // Find in MONGODB using the taskId, using the findOne()
        let data = await db.collection( process.env.COLLECTION ).findOne(
            {
                '_id' : ObjectId( taskId )
            }
        );

        // pass the data to hbs
        res.render('update.hbs', {
            'data' : data
        });
    })
    // .post route
    app.post('/:taskId/update', async (req,res)=>{

        // retrieve the taskId from the params object
        let taskId = req.params.taskId;

        // retrieve the form details from the body object
        let username = req.body.username;

        // let newData = {
        //     username : username
        // };

        // Update the data in MONGODB using the taskId and the updateOne()
        db.collection( process.env.COLLECTION ).updateOne(
            {
                '_id' : ObjectId( taskId )
            },
            {
                '$set' : {
                    username : username
                }
            }
        )

        // redirect route to root
        res.redirect('/');
    })

    // ******************************************************
    // DELETE ROUTE - REMOVE ONE FROM MONGODB 
    // ******************************************************

    // .get route
    app.get('/:taskId/delete', async (req,res)=>{
        
        // retrieve the taskId from the params object (Same as in Update route)
        let taskId = req.params.taskId;

        // Find in MONGODB using the taskId, using the findOne()
        let data = await db.collection( process.env.COLLECTION ).findOne(
            {
                '_id' : ObjectId( taskId )
            }
        );

        res.render('delete.hbs', {
            'data' : data
        })
    })
    // .post route
    app.post('/:taskId/delete', async (req,res){
        
        // retrieve the taskId from the params object (Same as in Update route)
        let taskId = req.params.taskId;

        // Find in MONGODB using the taskId, using the findOne()
        db.collection( process.env.COLLECTION ).deleteOne(
            {
                '_id' : ObjectId( taskId )
            }
        );
        
        res.redirect('/')
    })

// ============================================
// ============== 3. L I S T E N ==============
// ============================================
    // LISTEN - SET THE PORT TO CONNECT 
    app.listen(3000, function () {
        console.log("...We Are Serving...")
    });

}
main();