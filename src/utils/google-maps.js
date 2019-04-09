const googleMapsClient = require("@google/maps").createClient({
  key: require("./config").googleApiKey,
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
