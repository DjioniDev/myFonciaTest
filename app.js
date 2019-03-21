//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

const clientModel = require('./src/client');
const lotModel = require('./src/lot');

app.set('view engine', 'ejs');

const db = require("./config/keys").mongoURI;
mongoose
  .connect(
    db,
    { useNewUrlParser: true } //need this for api support
  )
  .then(() => console.log("mongoDB connected"))
  .catch(err => console.log(err));
/* fin du code de connection pour la db */

let clientFoncia = [];
let lotClient = [];
let propriete = [];

const userSchema = {
    username: String,
    password: String
};

const User = new mongoose.model("User", userSchema);


app.use(bodyParser.json({extended: true}));
app.use(express.static("public"));

app.get('/', (req, res)=>{
    res.render('home');
});


app.get('/login', function(req, res){
    res.render('login');
  });



app.get('/client', (req, res)=>{
    const title = 'Le fichier client';
    clientFoncia = [];
    
    clientModel.find((err, clients)=>{
        if(err){
            console.error('could not retirieve from DB');
            res.sendStatus(500);
        }else {
           clientFoncia = clients;
           res.render('client', {clients: clientFoncia, title: title});
        }
    
    });

  
});






app.post('/register', (req, res)=>{
    const newUser = new User({
        username: req.body.username,
        password: req.body.password
    });

    newUser.save(function(err){
        if(err){
            console.log(err);
        } else {
            res.render("secrets");
        }
    });
});

app.post('/login', (req, res)=>{
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({username: username}, (err, foundUser)=>{
        if(err){
            console.log(err);
        } else {
            if (foundUser){
                if(foundUser.password === password){
                    res.render('secrets');
                }
            }
        }
    });

});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
  });

app.get('/group', (req, res)=>{
    let propriete = [];
  
    var agg = [
        {$group: {
          _id: "$client",
          
          
          // SUCCESS!!! :D
          total: {$sum: 1}
        }}
      ];
    
      lotModel.aggregate(agg, function(err, lots){
        if (err) { console.log('erreur de groupement'); 
    }else {
        //console.log(logs);
      
        propriete = lots;
              
                res.render('group', {lots: propriete});
    }
    
        
      });


});

app.get('/join', (req, res)=>{
    let joinClub = [];
  
   
    var join = [
       
        
        {
          $lookup:
            {
              from: "lotModel",
              localField: "client",
              foreignField: "fullname",
              as: "joinClub"
            }
       }
       
    ];
    lotModel.aggregate(join, function(err, logs){
                if (err) { console.log('erreur de groupement'); 
            }else {
                console.log(logs);
            }
        });

   
 


});



app.get('/fiche-client', (req, res)=>{
    

    var agg = [
       
        {$group:{_id: "$client",client:{$sum:1}}},
        {$sort:{_id:-1}}
      ];
     
    
      lotModel.aggregate(agg, function(err, lots){
        if (err) { console.log('erreur de groupement'); 
    }else {
        //console.log(logs);
      
        propriete = lots;
              
                res.render('fiche-client',{lots: propriete});
    }


      });
    
    
    });
 




const PORT = process.env.PORT || 7000;
app.listen(PORT);