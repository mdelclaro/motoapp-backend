const googleMapsClient = require("@google/maps").createClient({
  key: "AIzaSyBtJI4iAvzXZw9o5k2Ee9UwgVyR0vX0vPs",
  Promise: Promise
});

module.exports = {
  getDistanceTime: (origins, destinations) => {
    return new Promise((resolve, reject) => {
      googleMapsClient
        .distanceMatrix({
          origins,
          destinations
        })
        .asPromise()
        .then(response => {
          return response.json;
        })
        .then(parsedRes => {
          resolve(parsedRes.rows[0].elements[0]);
        })
        .catch(err => {
          console.log(err);
          reject();
        });
    });
  }
};
