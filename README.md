# MotoApp - Node.js API

Back-end application to serve the mobile apps

* [Driver's app](https://github.com/mdelclaro/motoappdriver-mobile)
* [Client's app](https://github.com/mdelclaro/motoapp-mobile)

### Running the application:
``` 
$ npm install
$ npm start
$ npm run dev # runs in development mode with Nodemon
```
### Testing:
```
$ npm test
```

### Project's simplified structure:
```
.
├── docs/                       # API docs
├── images/                     # Images folder
├── src/                        # Source code
│   ├── controllers/            # API controllers
│   │   └── ...    
│   ├── middlewares/            # API middlewares (auth) 
│   │   └── ...    
│   ├── models/                 # Schema's models    
│   │   └── ...    
│   ├── routes/                 # API's routes
│   │   └── ...  
│   ├── utils/                  # Util functions (error handling, socket, etc)
│   │   └── ...
│   ├── App.js                  # App starting point after auth
│   ├── config.js               # App constants
│   ├── register-screens.js     # Screens registration for navigation
│   └── utils.js                # Util functions
├── test/                       # Testing folder
├── app.js                      # App starting point
└── ...                         # Other configuration and standard files
```
