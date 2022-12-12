const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const ejsmate = require('ejs-mate');
const mongoose = require('mongoose');
const Campground = require('./models/campground');
const { readSync } = require('fs');
const { findByIdAndDelete } = require('./models/campground');
const app = express();
const catchAsync = require('./utils/catchAsync');

mongoose.connect('mongodb://localhost:27017/yelp-camp',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(res => {
    console.log('Database connected');
}).catch(e => {
    console.log('oh no error ' + e);
})

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.engine('ejs', ejsmate);

app.get('/', (req, res) => {
    res.render("home");
});

app.get('/campgrounds', catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('./campgrounds/index', { campgrounds })
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('./campgrounds/new');
})

app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('./campgrounds/show', { campground })
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    const { id } = req.params;
    const found = await Campground.findById(id);
    res.render('./campgrounds/edit', { found });
}));


app.put('/campgrounds/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, req.body.campground);
    res.redirect(`/campgrounds/${id}`);
}));

app.post('/campgrounds', catchAsync(async (req, res) => {
    const data = req.body;
    const newcampground = new Campground(req.body.campground);
    await newcampground.save();
    res.redirect(`/campgrounds/${newcampground.id}`);

}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds');
}));

app.use((err, req, res, next) => {
    res.send("got an error");
})

app.listen(3000, () => {
    console.log("listning on port 3000");
});