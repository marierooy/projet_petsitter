require('dotenv').config();
const bcrypt = require('bcrypt');
const { sequelize, User, Role, AnimalType, Service, Occurence, CareMode } = require('../models');

async function syncDatabase() {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion à la base de données réussie.');

    // await sequelize.sync({ force: true });
    await sequelize.sync({ alter: true });
    console.log('✅ Base de données synchronisée.');

    // Initialiser les rôles s'ils n'existent pas
    const count = await Role.count();
    if (count === 0) {
      await Role.bulkCreate([
        { name: 'petsitter' },
        { name: 'owner' },
        { name: 'admin' }
      ]);
      console.log('✅ Rôles insérés.');
    }

    // Vérifier si l'utilisateur admin existe
    let adminUser = await User.findOne({ where: { email: 'rooy.marie@gmail.com' } });
    if (!adminUser) {
      const hashedPassword = await bcrypt.hash('Mitchoune-28', 10);
      adminUser = await User.create({
        first_name: 'Admin',
        last_name: 'User',
        email: 'rooy.marie@gmail.com',
        password: hashedPassword,
      });
      console.log('✅ Utilisateur admin créé.');
      // Associer l'utilisateur au rôle admin
      const adminRole = await Role.findOne({ where: { name: 'admin' } });
      await adminUser.addRole(adminRole); // méthode générée automatiquement par Sequelize
      const petsitterRole = await Role.findOne({ where: { name: 'petsitter' } });
      await adminUser.addRole(petsitterRole); // méthode générée automatiquement par Sequelize
      console.log('✅ Rôle admin et petsitter assigné à rooy.marie@gmail.com');
    }

    // 4. Insérer les types d'animaux
    const countAnimalTypes = await AnimalType.count();
    if (countAnimalTypes === 0) {
      const animalTypes = [
        'Petit chien (<9 kg)',
        'Chien de 10 à 20 kg',
        'Chien de 20 à 40kg',
        'Chien >40kg',
        'Chat',
        'Furet',
        'Oiseau',
        'Reptile',
        'Poisson',
        'Tortue',
        'Poule'
      ];

      await AnimalType.bulkCreate(animalTypes.map(name => ({ name })));
      console.log('✅ Types d\'animaux insérés.');
    } else {
      console.log('Types d\'animaux déjà insérés.');
    }
    // 4. Insérer les services
    const countServices = await Service.count();
    if (countServices === 0) {
      const services = [
        { label: 'Promenade', basic_service: true },
        { label: 'Donner à manger / à boire', basic_service: true },
        { label: 'Changer la litière', basic_service: true },
        { label: 'Nettoyer la cage', basic_service: true },
        { label: "Changer l'eau du bocal", basic_service: true },
        { label: 'Acheter à manger', basic_service: false },
        { label: 'Acheter de la litière', basic_service: false },
        { label: 'Toilettage', basic_service: false },
        { label: 'Consultation vétérinaire', basic_service: false },
        { label: 'Soigner une blessure', basic_service: false },
        { label: 'Donner des médicaments', basic_service: false },
        { label: 'Appliquer une piqure', basic_service: false },
      ];
      await Service.bulkCreate(services);
      console.log('✅ Services insérés.');
    } else {
      console.log('Services déjà insérés.');
    }

        // 4. Insérer les services
    const countOccurences = await Occurence.count();
    if (countOccurences === 0) {
      const Occurences = [
        '1 fois',
        '2 fois',
        '3 fois',
        '1 fois par jour',
        '2 fois par jour',
        '3 fois par jour',
        '1 fois par semaine',
        '2 fois par semaine',
        '3 fois par semaine'
      ];
      await Occurence.bulkCreate(Occurences.map(label => ({ label })));
      console.log('✅ Occurences insérées.');
    } else {
      console.log('Occurences déjà insérées.');
    }
        // 5. Insérer les careModes
    const countCareModes = await CareMode.count();
    if (countCareModes === 0) {
      const careModes = [
        { label: 'sitter' },
        { label: 'home' },
      ];
      await CareMode.bulkCreate(careModes);
      console.log('✅ Services insérés.');
    } else {
      console.log('Services déjà insérés.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la synchronisation :', error);
  } finally {
    await sequelize.close();
    console.log('🔒 Connexion fermée.');
  }
}

syncDatabase();