require('dotenv').config();
const mongoose = require('mongoose');
const Campground = require('../models/campgrounds.js');
const cities = require('./cities.js');
const { places, descriptors } = require('./seedHelpers.js');
const { images } = require('./images.js');
const { coordinates } = require('@maptiler/client');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

const sample = (arr) => arr[Math.floor(Math.random() * arr.length)];

async function seedDB() {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 200) + 50;
        const loc = `${cities[random].city}, ${cities[random].state}`;
        try{
            const camp = new Campground({
                title: `${sample(descriptors)} ${sample(places)}`,
                geometry:{
                    type:"Point",
                    coordinates:[
                        cities[random].longitude,cities[random].latitude
                    ]
                },
                images: [
                    sample(images),
                    sample(images),
                    sample(images)
                ],
                price: price,
                author: '67bb49695c7122ef71bfa233',
                location: loc,
                description: "Lorem ipsum dolor sit amet..."
            });

            await camp.save();
            console.log(`Saved: ${camp.title}`);
        } catch (error) {
            console.error(`Error processing ${loc}:`, error);
        }
    }
    console.log("Seeding complete!");
    mongoose.connection.close();
}

seedDB();
