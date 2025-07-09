const request = require('supertest');
const app = require('../app');
const sequelize = require('../config/db.config');

const net = require('net');

async function waitForPort(port, host = '127.0.0.1', timeout = 10000) {
    const start = Date.now();
    return new Promise((resolve, reject) => {
        const tryConnect = () => {
        const socket = new net.Socket();
        socket.setTimeout(1000);

        socket.once('connect', () => {
            socket.destroy();
            resolve();
        });

        socket.once('error', () => {
            socket.destroy();
            if (Date.now() - start > timeout) {
            reject(new Error(`Timeout waiting for ${host}:${port}`));
            } else {
            setTimeout(tryConnect, 200);
            }
        });

        socket.once('timeout', () => {
            socket.destroy();
            if (Date.now() - start > timeout) {
            reject(new Error(`Timeout waiting for ${host}:${port}`));
            } else {
            setTimeout(tryConnect, 200);
            }
        });

        socket.connect(port, host);
        };

        tryConnect();
    });
}

describe('Auth routes', () => {

    beforeAll(async () => {       
        await waitForPort(3307);
        await sequelize.authenticate();
        await sequelize.sync({ force: true });
    });
    
    afterAll(async () => {
        await sequelize.close();
    });

    test('POST /api/auth/register - échoue si champs obligatoires manquants', async () => {
        const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@example.com', password: 'motdepasse123' }); // Manque role, first_name, nom

        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(Array.isArray(res.body.errors)).toBe(true);
        expect(res.body.errors.length).toBeGreaterThan(0);
    });

    test('POST /api/auth/register - réussit avec tous les champs obligatoires', async () => {
        const res = await request(app)
        .post('/api/auth/register')
        .send({
            role: 'petsitter',
            first_name: 'Marie',
            last_name: 'Rooy',
            email: 'marie@example.com',
            password: 'motdepasse123'
        });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('message', 'Compte créé');
    });

    test('POST /api/auth/login - réussit avec des identifiants valides', async () => {
        // Prérequis : on enregistre un utilisateur
        await request(app)
        .post('/api/auth/register')
        .send({
            role: 'petsitter',
            first_name: 'Alice',
            last_name: 'Dupont',
            email: 'alice@example.com',
            password: 'motdepasse456'
        });
    
        // Ensuite : on teste le login avec les bons identifiants
        const res = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'alice@example.com',
            password: 'motdepasse456'
        });
    
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('token');
        expect(typeof res.body.token).toBe('string');
    });
    
    test('POST /api/auth/login - échoue avec un mauvais mot de passe', async () => {
        const res = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'alice@example.com',
            password: 'mauvaismotdepasse'
        });
    
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });
    
    test('POST /api/auth/login - échoue si email non enregistré', async () => {
        const res = await request(app)
        .post('/api/auth/login')
        .send({
            email: 'inconnu@example.com',
            password: 'nimportequoi'
        });
    
        expect(res.statusCode).toBe(401);
        expect(res.body).toHaveProperty('error');
    });
});

