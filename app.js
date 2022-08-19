const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-mihir:mugeer%40224@cluster0.ly91ewg.mongodb.net/todolistDB", {useNewUrlParser: true});
const itemsSchema={
  name:String
} 
const Item=mongoose.model("Item",itemsSchema); //using the singular name for the items collection

const item1=new Item({
  name:"Welcome"
});
const item2=new Item({
  name:"Click + to add"
});
const item3=new Item({
  name:"<-- Click to delete"
});

// const items = ["Buy Food", "Cook Food", "Eat Food"];
const defaultItems=[item1,item2,item3];
 
const listSchema={
  name:String,
  items:[itemsSchema] //an array of item schema documents
}

const List=mongoose.model("List",listSchema);
// Item.insertMany(defaultItems, function(err){  //to insert many items at once into the items collection
//   if(err){
//     console.log(err);
//   }
//   else{
//     console.log("Success!");
//   }
// });
const workItems = [];

app.get("/", function(req, res) {
Item.find(function(err, items){
  if(err){
    console.log(err);
  }
  else{
    if(items.length===0){
      Item.insertMany(defaultItems, function(err){  //to insert many items at once into the items collection
  if(err){
    console.log(err);
  }
  else{
    console.log("Success!");
  }
});
    }
    else{
    res.render("list", {listTitle: day, newListItems: items});
  }}
});
const day = date.getDate();
  
  

});

app.post("/", function(req, res){
  const day = date.getDate();
  const itemName  = req.body.newItem;
  const item=new Item({
    name:itemName
  });
  const listName=req.body.list;
  if(listName===day){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,lists){ //to find the custom list 
      lists.items.push(item); //pushing the new item in the items array of the custom list
      lists.save();
      res.redirect("/"+listName); 
    });
  }
  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",function(req,res){
const day = date.getDate();
 const checkedItemId=req.body.checkbox; //returns the value of the checkbox input
 const listName=req.body.listName;
 if(listName===day){
  Item.findByIdAndRemove(checkedItemId,function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("success!");
      res.redirect("/");
    }
  });
 }else{
   List.findOneAndUpdate({name: listName},{$pull: {items:{_id:checkedItemId}}},function(err,lists){ //returns the list with the specified name
       if(!err){
         res.redirect("/"+listName);
       }
      });
 }
  
 });

 app.get("/:listName",function(req,res){
   const listName=_.capitalize(req.params.listName);
   List.findOne({name:listName},function(err, lists){
     if(!err){
       if(!lists){
         const list=new List({
           name:listName,
           items:defaultItems
         });
         list.save();
         res.redirect("/"+listName);
       }
       else{
         res.render("list", {listTitle: lists.name, newListItems: lists.items});
       }
     }
   });
  
 });
// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });

app.get("/about", function(req, res){
  res.render("about");
});
let port=process.env.PORT
if(port==null||port==""){
  port=3000;
}
app.listen(port);
