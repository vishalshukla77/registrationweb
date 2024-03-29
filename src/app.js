require('dotenv').config();
const express = require("express");
const path = require("path");
const app = express();
const hbs = require("hbs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cookieParser= require("cookie-parser");
const auth=require("./middleware/auth");
require("./db/conn");
const Register = require("./models/registers");
const { json } = require("express");
const { log } = require("console");
const port = process.env.PORT || 5500;
const static_path = path.join(__dirname, "../public" );
const template_path = path.join(__dirname, "../templates/views" );
const partials_path = path.join(__dirname, "../templates/partials" );
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:false}));
app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);
app.get("/", (req, res) => {
    res.render("index")});
app.get("/secret",auth, (req, res) => {

res.render("secret")});
app.get("/logout",auth, async(req, res) => {
try {   
    //single devices
   // req.user.tokens=req.user.tokens.filter((currelement)=>{
    //return currelement!=req.token})

    //logout from all devices

    req.user.tokens=[];
    

    res.clearCookie("jwt");
    console.log("logout succesfully")
    await req.user.save();
    res.render("login");
    
} catch (error) {
    res.status(500).send(error);
    
}
    });

app.get("/register", (req, res) =>{
     res.render("register");
})
app.get("/login", (req, res) =>{ res.render("login");
})

app.post("/register", async (req, res) =>{
try { const password = req.body.password;
      const cpassword = req.body.confirmpassword;
if(password === cpassword){
        const registerEmployee = new Register({
                firstname: req.body.firstname,
                lastname:req.body.lastname,
                email:req.body.email,
                gender:req.body.gender,
                phone:req.body.phone,
                age:req.body.age,
                password:req.body.password,
                confirmpassword:req.body.confirmpassword    
        })

        console.log("the success part" + registerEmployee);

        const token = await registerEmployee.generateAuthToken();
        console.log("the token part" + token);
        res.cookie("jwt",token,{
            expires:new Date(Date.now()+600000),
            httpOnly:true
        });
      // Corrected line
console.log(res.cookie);

const registered = await registerEmployee.save();
console.log("the page part" + registered);

res.status(201).render("index");


      }else{
          res.send("password are not matching")
      }
        
    } catch (error) {
        console.log("Error during registration:", error);
    res.status(400).send("Error during registration: " + error.message);
    }
})



app.post("/login", async(req, res) =>{
   try {
    
        const email = req.body.email;
        const password = req.body.password;

        const useremail = await Register.findOne({email:email});

        const isMatch = await bcrypt.compare(password, useremail.password);

        const token = await useremail.generateAuthToken();
        console.log("the token part" + token);
        res.cookie("jwt",token,{
            expires:new Date(Date.now()+60000),
            httpOnly:true,
      
        });
       

       
        if(isMatch){
            res.status(201).render("index");
        }else{
           res.send("invalid Password Details"); 
        }
    
   } catch (error) {
       res.status(400).send("invalid login Details")
   }
})



app.listen(port, () => {
    console.log(`server is running at port no ${port}`);
})

