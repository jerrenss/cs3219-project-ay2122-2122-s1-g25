const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const { errorHandler, notFound } = require('./middleware/middleware');

//Server imports
const PORT = process.env.PORT || 4000;
const app = express();
const server = app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});

// Route imports
const userRoutes = require('./routes/users')
const questionRoutes = require('./routes/questions')
const userMatchingRoutes = require('./routes/userMatching')
const interviewSessionRoutes = require('./routes/interviewSession')
const rotationRoutes = require('./routes/rotation')
const feedbackRoutes = require('./routes/feedback')

//Websocket imports
const socketDriver = require('./sockets')
socketDriver(server)

// CORS settings
// TODO: add back CORS whitelist
// const corsWhitelist = ['http://localhost:3000', 'https://upskilltoday.org']
// const corsOptions = {
//   origin: function (origin, callback) {
//     if (corsWhitelist.indexOf(origin) !== -1) {
//       callback(null, true)
//     } else {
//       callback(new Error('Not allowed by CORS'))
//     }
//   }
// }
// app.use(cors(corsOptions));

// JWT imports
const admin = require('firebase-admin')

admin.initializeApp({
  credential: admin.credential.cert({
    "project_id": process.env.FIREBASE_PROJECT_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY,
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
  }),
  databaseURL: ""
});

app.use(cors())

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());

app.get('/', (req, res) => {
  res.json({
    data: 'Welcome! Let\'s Upskill now!',
  });
});
app.use('/api/users', authenticateToken, userRoutes)
app.use('/api/questions', authenticateToken, questionRoutes);
app.use('/api/matching', authenticateToken, userMatchingRoutes);
app.use('/api/interview', authenticateToken, interviewSessionRoutes);
app.use('/api/rotation', authenticateToken, rotationRoutes);
app.use('/api/feedback', authenticateToken, feedbackRoutes);

app.use(notFound);
app.use(errorHandler);

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  // no token, unauthenticated
  if (token == null) return res.sendStatus(401);
  // has token, verify token  
  admin.auth().verifyIdToken(token)
    .then(() => {
      next()
    }).catch(() => {
      res.status(403).send('Unauthorized')
    });
}
