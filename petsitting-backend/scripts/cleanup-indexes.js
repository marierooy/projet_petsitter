const mysql = require('mysql2/promise');
const inquirer = require('inquirer');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'Mitchoune-28',
  database: 'petsitting', // adapte ici si besoin
};

const TARGET_TABLE = 'Users';
const TARGET_COLUMN = 'email';

(async () => {
  const connection = await mysql.createConnection(config);
  console.log(`📦 Connexion à la base : ${config.database}`);

  const [indexes] = await connection.execute(`SHOW INDEX FROM \`${TARGET_TABLE}\`;`);

  const emailIndexes = indexes.filter(i => i.Column_name === TARGET_COLUMN);

  if (emailIndexes.length <= 1) {
    console.log(`✅ Un seul index trouvé sur '${TARGET_COLUMN}' : rien à supprimer.`);
    return process.exit(0);
  }

  console.log(`⚠️ ${emailIndexes.length} index trouvés sur '${TARGET_COLUMN}' dans la table '${TARGET_TABLE}':`);
  emailIndexes.forEach(i => {
    console.log(`  • ${i.Key_name} (${i.Non_unique === 0 ? 'UNIQUE' : 'NON-UNIQUE'})`);
  });

  const { toDrop } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'toDrop',
      message: 'Quels index veux-tu supprimer ? (ne laisse qu’un index UNIQUE sur email)',
      choices: emailIndexes.map(i => ({
        name: `${i.Key_name} (${i.Non_unique === 0 ? 'UNIQUE' : 'NON-UNIQUE'})`,
        value: i.Key_name,
      })),
    },
  ]);

  if (toDrop.length === 0) {
    console.log('❌ Aucune suppression effectuée.');
    return process.exit(0);
  }

  for (const key of toDrop) {
    console.log(`🧹 Suppression de l'index : ${key}`);
    await connection.execute(`DROP INDEX \`${key}\` ON \`${TARGET_TABLE}\`;`);
  }

  console.log('✅ Opération terminée.');
  await connection.end();
})();