require('dotenv').config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
  });
const express = require('express');
const path = require('path');

const app = express();
const authRoutes = require('./routes/auth.routes');
const animalRoutes = require('./routes/animal.routes');
const animalTypeRoutes = require('./routes/animalType.routes');
const serviceRoutes = require('./routes/service.routes');
const occurenceRoutes = require('./routes/occurence.routes');
const availabilityRoutes = require('./routes/availability.routes');
const offerRoutes = require('./routes/offer.routes');
const availabilityTypesRoutes = require('./routes/availabilityType.routes');
const sequelize = require('./config/db.config');
const userRoutes = require('./routes/user.routes');
const careModeRoutes = require('./routes/careMode.routes');
const advertRoutes = require('./routes/advert.routes');
const matchingRoutes = require('./routes/matching.routes');
const contractRoutes = require('./routes/contract.routes');

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/animal', animalRoutes);
app.use('/api/animal-type', animalTypeRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/occurence', occurenceRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/offer', offerRoutes);
app.use('/api/availability-type', availabilityTypesRoutes);
app.use('/api/user', userRoutes);
app.use('/api/care-mode', careModeRoutes);
app.use('/api/advert', advertRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/contract', contractRoutes);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

sequelize.sync();

module.exports = app;