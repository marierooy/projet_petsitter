const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const port = 3000;

app.use(express.json()); // Pour parser le JSON dans les requêtes

const userRoutes = require('./routes/auth.routes');
const animalRoutes = require('./routes/animal.routes');
const animalTypeRoutes = require('./routes/animalType.routes');
const serviceRoutes = require('./routes/service.routes');
const occurenceRoutes = require('./routes/occurence.routes');
const availabilityRoutes = require('./routes/availability.routes');
const offerRoutes = require('./routes/offer.routes');
const availabilityTypesRoutes = require('./routes/availabilityType.routes');

app.use('/api/auth', userRoutes);
app.use('/api/animal', animalRoutes);
app.use('/api/animal-type', animalTypeRoutes);
app.use('/api/service', serviceRoutes);
app.use('/api/occurence', occurenceRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/offer', offerRoutes);
app.use('/api/availability-type', availabilityTypesRoutes);

// Route de test à la racine
app.get('/', (req, res) => {
  res.send('Bienvenue sur le backend Petsitting !');
});

const db = require('./models'); // Chemin vers tes modèles Sequelize

db.sequelize.sync({ alter: true }) // ou { force: true } pour forcer la recréation
  .then(() => {
    console.log('Base synchronisée');
    app.listen(port, () => console.log(`Serveur en écoute sur le port ${port}`));
  })
  .catch(console.error);