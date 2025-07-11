require('dotenv').config({
    path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
  });
const express = require('express');
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

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/animal', animalRoutes);
app.use('/api/animal-type', animalTypeRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/occurence', occurenceRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/offer', offerRoutes);
app.use('/api/availability-type', availabilityTypesRoutes);

sequelize.sync();

module.exports = app;