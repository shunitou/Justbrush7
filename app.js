const express = require('express');
const session = require('express-session');
const RedisStore = require('connect-redis')(session);
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const multer = require('multer');
const bcrypt = require('bcrypt');
const pool = require('./database');
const path = require('path');
const registerRoute = require('./routes/register');
const uploadRoute = require('./routes/upload');
const checkRoute = require('./routes/check');
const pointsRoute = require('./routes/points');
const withdrawRoute = require('./routes/withdraw');
const upload = multer({ dest: 'uploads/' });
const userRoute = require('./routes/user');
const loginRoute = require('./routes/login');
const homeRoute = require('./routes/home');
const logoutRoute = require('./routes/logout');
const flash = require('connect-flash');
const helmet = require('helmet');
const redis = require('redis');

require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

const redisClient = redis.createClient({
  // add Redis connection details
  host: 'your-redis-host',
  port: 6379,
  // any other configuration options if needed
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET || 'your-default-secret-key',
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/dashboard', (req, res) => {
  const filePath = 'dashboard.html';
  res.sendFile(path.join(__dirname, 'views', filePath));
});


passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await pool.query('SELECT id, username, password, role FROM users WHERE username = $1', [username]);

      if (!user.rows.length) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const validPassword = await bcrypt.compare(password, user.rows[0].password);

      if (!validPassword) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user.rows[0]);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await pool.query('SELECT id, username, role FROM users WHERE id = $1', [id]);

    if (user.rows.length > 0) {
      done(null, { ...user.rows[0], userRole: user.rows[0].role });
    } else {
      done(null, false); // User not found
    }
  } catch (error) {
    done(error);
  }
});

app.use('/', logoutRoute); 
app.use('/', homeRoute);
app.use('/', loginRoute);
app.use('/', userRoute);
app.use('/', registerRoute);
app.use('/', uploadRoute);
app.use('/', checkRoute);
app.use('/', pointsRoute);
app.use('/', withdrawRoute);
app.use(helmet());

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
