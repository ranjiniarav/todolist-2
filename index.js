import express from "express";
import bodyParser from "body-parser";
import ejs from "ejs"
import mongoose from "mongoose";
import _ from "lodash";
import dotenv from "dotenv";
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

const app = express();
 const PORT = process.env.PORT || 3000;
 mongoose.set('strictQuery',false);
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
// mongoose.connect("mongodb+srv://RanjiniMongodbatlas:ranjinizantro3105@cluster0.l7bhcxj.mongodb.net/todolistDB");
 const connectDB = async ()=>{
  try{
   const conn = await mongoose.connect(process.env.MONGO_URI);
  }
  catch(error){
    console.log(error);
    process.exit(1);
  }
 }
const itemsSchema = {
  name:String
};
 
const Item = mongoose.model(
  "Item",itemsSchema
);
 
const item1 = new Item({
  name:"work"
})
 
const item2 = new Item({
  name:"play"
})
 
const item3 = new Item({
  name:"gym"
})
 
const listSchema = {
  name:String,
  items:[itemsSchema]
}
 
const defaultItems = [item1,item2,item3];
 
const List = mongoose.model("List", listSchema);
 
app.get("/", function(req, res) {
 
  Item.find({})
  .then(function(foundItems){
    if(foundItems.length === 0){
 
      Item.insertMany(defaultItems)
        .then(function(){
        console.log("added db");
        })
        .catch(function(err){
        console.log(err);
        });
        res.redirect("/");
    }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
  })
  .catch(function(err){
    console.log(err);
  })
});
app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  if(listName  ==="Today"){
    Item.findByIdAndDelete(checkedItemId)
    .then(function(){
      console.log("deleted item");
      })
    .catch(function(err){
      console.log(err);
      });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}}).then(function(err,foundList){
        if(!err){
          res.redirect('/'+listName);
        }
    })
  }
})
 
app.post("/", function(req, res){
 
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name:itemName
  })
  if(listName=== "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName}).then(function(foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect('/'+ listName);

    })

  }
    
 
});
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
 
  List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItems
            });
          
            list.save();
            console.log("saved");
            res.redirect("/"+customListName);
          }
          else{
            res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
          }
    })
    .catch(function(err){});
 
 
  })
 
  app.get("/about", function(req, res){
    res.render("about");
  });
   
  app.listen(3000, function() {
    console.log("Server started on port 3000");
  });
   
  