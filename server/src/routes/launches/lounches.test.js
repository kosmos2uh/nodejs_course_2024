const request = require('supertest');
const app = require('../../app');
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Test lounges API', () => {

    beforeAll(async () => {
        await mongoConnect();
    });

    afterAll(async () => {
        await mongoDisconnect();
    });

    describe('Test GET /launches', () => {
        test('It should respond with status 200', async () => {
            await request(app)
                .get('/v1/launches')
                .expect(200)
                .expect('Content-Type', /json/);
        });
    });

    describe('Test POST /v1/launches', () => {
        const newLaunch = {
            mission: 'test mission',
            rocket: 'test rocket',
            target: 'Kepler-62 f',
            launchDate: '2022-12-14',
        };

        const newLaunchWithoutDate = {
            mission: 'test mission',
            rocket: 'test rocket',
            target: 'Kepler-62 f',
        };

        const newLaunchWithInvalidDate = {
            mission: 'test mission',
            rocket: 'test rocket',
            target: 'Kepler-62 f',
            launchDate: 'invalid date',
        };

        test('It should respond with status 201', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(newLaunch)
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(201);

            const requestDate = new Date(newLaunch.launchDate).valueOf();
            const responseDate = new Date(response.body.launchDate).valueOf();
            expect(responseDate).toEqual(requestDate);

            expect(response.body).toMatchObject(newLaunchWithoutDate);
        });

        test('It should catch missing required properties', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(newLaunchWithoutDate)
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({ error: 'Missing required launch property' });
        });

        test('It should catch invalid date', async () => {
            const response = await request(app)
                .post('/v1/launches')
                .send(newLaunchWithInvalidDate)
                .set('Content-Type', 'application/json')
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toStrictEqual({ error: 'Invalid launch date' });
        });
    });
});
