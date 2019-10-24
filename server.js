'use strict';

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();
const superagent = require('superagent');

app.use(cors());

const PORT = process.env.PORT || 3003;


app.get('/location', handleLocation);
app.get('/weather', handleWeather);
app.get('/trails', handleTrails);
app.get('*', handleError);


//cached data:
let storedUrls = {};

function handleTrails(request, response) {
  const trail = request.query.data;
  console.log(`trail: ${trail}`);
  const url = `https://www.hikingproject.com/data/get-trails?lat=40.0274&lon=-105.2519&maxDistance=10&key=${process.env.TRAILS_API_KEY}`;


  if (storedUrls[url]) {
    console.log('using cached url');
    response.send(storedUrls[url]);
  } else {
    console.log('making the api call to trails');
    superagent.get(url)
      .then(resultsFromSuperagent => {
        let trailsArr = resultsFromSuperagent.body.trails;
        console.log(trailsArr);
        let returnedTrailObjs = [];
        trailsArr.forEach(obj => {
          returnedTrailObjs.push(new Trail(obj));
        });
        console.log(returnedTrailObjs);
        storedUrls[url] = returnedTrailObjs;
        response.status(200).send(returnedTrailObjs);

      })
      .catch((error) => {
        console.error(error);
        response.status(500).send('server error.');
      });

  }
}

// delete appObj.a;


function Trail(obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.star_votes;
  this.summary = obj.summary;
  this.trail_url = obj.trail_url;
  this.conditions = obj.conditionStatus;
  this.condition_date = obj.conditionDate.split(' ')[0];
  this.condition_time = obj.conditionDate.split(' ')[1];
}



function handleLocation(request, response) {
  const location = request.query.data;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODE_API_KEY}`;

  if (storedUrls[url]) {
    console.log('using cached url');
    response.send(storedUrls[url]);
  } else {
    console.log('making the api call to geocode');
    superagent.get(url)
      .then(resultsFromSuperagent => {
        const locationObject = new Location(location, resultsFromSuperagent.body.results[0]);
        storedUrls[url] = locationObject;
        response.status(200).send(locationObject);
        console.log('done using superagent for geocode');
      })
      .catch((error) => {
        console.error(error);
        response.status(500).send('server error.');
      });
  }
}


function Location(location, geoData) {
  this.search_query = location;
  this.formatted_query = geoData.formatted_address;
  this.latitude = geoData.geometry.location.lat;
  this.longitude = geoData.geometry.location.lng;
}

function handleWeather(request, response) {
  const locationObj = request.query.data;

  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${locationObj.latitude},${locationObj.longitude}`;

  if (storedUrls[url]) {
    console.log('using cached url');
    response.send(storedUrls[url]);
  } else {
    console.log('making the api call to darksky');
    superagent.get(url)
      .then(resultsFromSuperagent => {
        let daysOfWeather = resultsFromSuperagent.body.daily.data;
        console.log(daysOfWeather);
        let weatherArray = daysOfWeather.map(day => {
          return new Weather(day);
        });

        console.log('done calling the darksky API');
        response.status(200).send(weatherArray);
      })
      .catch((error) => {
        console.error(error);
        response.status(500).send('server error.');
      });
  };
};



function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time).toDateString();
}


// function Error(error, response) {
//   console.error(error);
//   return response.status(500).send('Sorry, there is a temporary problem.Please try it later.');
// }

function handleError(request, response) {
  response.status(404).send('Server connection problem');
};

app.listen(PORT, () => console.log(`app is listening on ${PORT}`));
