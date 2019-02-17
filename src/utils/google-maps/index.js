const googleMapsClient = require("@google/maps").createClient({
  key: "AIzaSyBtJI4iAvzXZw9o5k2Ee9UwgVyR0vX0vPs",
  Promise: Promise
});

// exports.getDistanceTime = (
//   origins = "Washington, DC, USA",
//   destinations = "New York, NY, USA"
// ) => {
googleMapsClient
  .distanceMatrix({
    origins: "Washington, DC, USA",
    destinations: "New York, NY, USA"
  })
  .asPromise()
  .then(response => {
    return response.json;
  })
  .then(parsedRes => {
    console.log(JSON.stringify(parsedRes.rows[0].elements[0], null, 4));
  })
  .catch(err => console.log(err));
// };
