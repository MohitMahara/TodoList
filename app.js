const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');
const _ = require('lodash');
const app = express();
const PORT = process.env.PORT ||8000;


const publicPath = path.join(__dirname, '/public');
const viewsPath = path.join(__dirname, '/views');


app.set('view engine', 'ejs');
app.set('views', viewsPath);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(publicPath));

mongoose.connect('mongodb+srv://maharamohit144:1234567890@cluster0.ene7uao.mongodb.net/todolistDB', {
  useNewUrlParser: true
});

const ItemsSchema = new mongoose.Schema({
  name: String
})

const Item = mongoose.model('Item', ItemsSchema);

const item1 = new Item({
  name: 'Welcome to your todolist!'
})

const item2 = new Item({
  name: 'Hit the + button to add a new item'
})

const item3 = new Item({
  name: "Hit the checkbox icon to delete an item"
})

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [ItemsSchema]
})

const List = mongoose.model('List', listSchema);

app.get('/', async (req, res) => {

  const items = await Item.find({});

  if (items.length === 0) {
    Item.insertMany(defaultItems);
    res.redirect('/');
  } else {
    res.render('index', {
      newListItems: items,
      listTitle : "Today"
    });

  }
})

app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/:customListName', (req, res) => {

  const CustomListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: CustomListName
  }).then(foundList => {

    if (!foundList) {
      // Create a new list
      const list = new List({
        name: CustomListName,
        items: defaultItems
      })

      list.save();
      res.redirect('/' + CustomListName);
    } else {
      // show an existing list

      res.render('index', {
        newListItems: foundList.items,
        listTitle : CustomListName
      })
    }

  });
})

app.post('/', (req, res) => {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  })

  if (listName === "Today") {
    item.save();
    res.redirect('/');
    window.location.reload();
  }
  else{

    List.findOne({name:listName}).then((list) =>{
      list.items.push(item);
      list.save();
      res.redirect('/' + listName);
      window.location.reload();
    });

  }
})

app.post('/delete', async (req, res) => {

  const checkedItemId = req.body.checkbox;
  const listName  = req.body.listName;

  if(listName === "Today"){
      await Item.findByIdAndRemove(checkedItemId);
      res.redirect('/');
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull : {items : {_id : checkedItemId}}}).then( () =>{
        res.redirect('/' + listName);
    })
  }


});


app.listen(PORT, () => {
  console.log(`listening to port ${PORT}`);
})