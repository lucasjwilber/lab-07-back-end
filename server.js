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
app.get('/trails', handleTrail);
app.get('*', handleError);


//cached data:
let storedUrls = {};

function handleTrail(request, response) {
  const trail = request.query.data;
  console.log(`trail: ${trail}`);
  const url = `https://www.hikingproject.com/data/get-trails?lat=40.0274&lon=-105.2519&maxDistance=10&key=${process.env.TRAILS_API_KEY}`;


  if (storedUrls[url]) {
    console.log('using cached url');
    response.send(storedUrls[url]);
  } else {
    console.log('making the api call to get weather info');
    superagent.get(url)
      .then(resultsFromSuperagent => {
        let routeOfTrails = resultsFromSuperagent.body.daily.data;
        console.log(routeOfTrails);
        let routeArray = routeOfTrails.map(route => {
          console.log('array of route', routeArray);
          response.status(200).send(weatherArray);

          return new Trail(route);
        })
      })
      .catch(error => {
        console.error('Error getting location info.');
      })

  }
}



function handleLocation(request, response) {
  const location = request.query.data;
  console.log(`location: ${location}`);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${location}&key=${process.env.GEOCODE_API_KEY}`;

  if (storedUrls[url]) {
    console.log('using cached url');
    response.send(storedUrls[url]);
  } else {
    console.log('making the api call to get location info');
    superagent.get(url)
      .then(resultsFromSuperagent => {
        console.log(resultsFromSuperagent.body.results[0]);
        const locationObject = new Location(location, resultsFromSuperagent.body.results[0]);
        storedUrls[url] = locationObject;
        response.status(200).send(locationObject);
        console.log('done using superagent for location info');
      })
      .catch(error => {
        console.error('Error getting location info.');
      })
  }
}


function Location(location, geoData) {
  this.search_query = location;
  this.formatted_query = geoData.formatted_address;
  this.latitude = geoData.geometry.location.lat;
  this.longitude = geoData.geometry.location.lng;
}

function handleWeather(request, response) {
  console.log('weather info:');
  const locationObj = request.query.data;
  console.log(locationObj);
  const latitude = locationObj.latitude;
  console.log('latitude:', latitude);
  const longitude = locationObj.longitude;

  // const tempArray = [];

  // darkskyData.daily.data.forEach(object => {
  //   let tempValue = new Weather(object);
  //   tempArray.push(tempValue);
  // })
  // try {
  //   response.status(200).send(tempArray);
  // }
  // catch (error) {
  //   Error(error, response)
  // }
  console.log(latitude, longitude);
  const url = `https://api.darksky.net/forecast/${process.env.DARKSKY_API_KEY}/${latitude},${longitude}`;

  if (storedUrls[url]) {
    console.log('using cached url');
    response.send(storedUrls[url]);
  } else {
    console.log('making the api call to get weather info');
    superagent.get(url)
      .then(resultsFromSuperagent => {
        let daysOfWeather = resultsFromSuperagent.body.daily.data;
        console.log(daysOfWeather);
        let weatherArray = daysOfWeather.map(day => {
          return new Weather(day);
        });

        console.log('array of weather', weatherArray);
        response.status(200).send(weatherArray);
      })
      .catch(error => {
        console.error('Error');
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
