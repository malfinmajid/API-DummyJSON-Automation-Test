const {test, expect} = require("@playwright/test");
const { request } = require("https");
const { json } = require("stream/consumers");
const {Ajv} = require ("ajv");

const ajv = new Ajv(); 

test.describe('Positive Test Case', () => {

    test('TC-001 (GET List All User)', async ({ request }) => {
        // API Call
        const response = await request.get('https://dummyjson.com/users');

        // Validasi Status Code
        expect(response.status()).toBe(200);
        expect(response.ok()).toBeTruthy();

        // Validasi Body 
        const body = await response.json();
        expect(body).toBeDefined();
        expect(body.total).toBeGreaterThan(0);
        expect(body.limit).toBeDefined();
        expect(body.skip).toBeDefined();
    });
    
    test('TC-002 (GET Single User By ID)', async ({ request }) => {
        // API Call
        const response = await request.get('https://dummyjson.com/users/2');

        // Assertion Status Code
        expect(response.status()).toBe(200);
        expect(response.ok()).toBeTruthy();

        // Assertion Body 
        const bodyData = await response.json();
        expect(bodyData.id).toBe(2);
        expect(bodyData.firstName).toBe('Michael');
        expect(bodyData.email).toBeDefined();

        // Assertion Json Schema
        const valid = ajv.validate(require('./jsonschema/GET-objectSchema.json'), bodyData)

        if(!valid){
            console.log("Ajv Validation Error:", ajv.errorsText());
        }; 
    
        expect(valid).toBe(true);
    });

    test('TC-003 (POST Create User)', async ({ request }) => {
        const headerData = {
            'Content-Type' : 'application/json'
        }
        const bodyData = {
                "firstName" : "Muhammad",
                "maidenName": "Alfin",
                "lastName" : "Majid",
                "age" : 25,
                "gender" : "male",
                "email" : "peopleofpeace@gmail.com",
        }

         // API Call
        const response = await request.post('https://dummyjson.com/users/add', {
            headers: headerData,
            data: bodyData,
        });
        
        // Validasi Status Code
        expect(response.status()).toBe(201);
        expect(response.ok()).toBeTruthy();

        // Validasi Body 
        const body = await response.json();
        expect(bodyData.firstName).toBe('Muhammad');
        expect(body.maidenName).toBe('Alfin');
        expect(bodyData.email).toBeDefined();
    });

    test('TC-004 (PUT Update User By ID)', async ({ request }) => {
        const userId = 2;
        const headerData = {
            'Content-Type' : 'application/json'
        }

        const bodyData = {
                "firstName" : "Kevin",
                "maidenName": "Parker",
                "lastName" : "Tame Impala",
                "age" : 26,
                "gender" : "male",
                "email" : "peopleofpeace@gmail.com",
        }

        // API Call
        const response = await request.put('https://dummyjson.com/users/2', {
            headers: headerData,
            data: bodyData,
        });
        
        // Validasi Status Code
        expect(response.status()).toBe(200);
        expect(response.ok()).toBeTruthy();

        // Validasi Body 
        const body = await response.json();
        expect(body.id).toBe(userId);
        expect(body.firstName).toBe(bodyData.firstName);
        expect(body.maidenName).toBe(bodyData.maidenName);
        expect(bodyData.email).toBeDefined();
    });

    test('TC-005 (POST Login Success Valid Credential)', async ({ request }) => {
        const headerData = {
            'Content-Type' : 'application/json'
        }

        const bodyData = {
                "username": "danielc",
                "password": "danielcpass",
                "expiresInMins" : 30 
        }

        // API Call
        const response = await request.post('https://dummyjson.com/users/login', {
            headers : headerData,
            data : bodyData,
        });

        // Validasi Status Code
        expect(response.status()).toBe(200);
        expect(response.ok()).toBeTruthy();

        // Validasi Body
        const responseBody = await response.json();
        expect(responseBody).toBeDefined();
        expect(responseBody).toHaveProperty('id');
        expect(bodyData).toHaveProperty('username');
        expect(bodyData).toHaveProperty('password');
        expect(responseBody).toHaveProperty('accessToken');
        expect(responseBody).toHaveProperty('refreshToken');
        expect(bodyData.username).toBe('danielc');
    });
});

test.describe('Negative Test Case', () => {
    test('TC-006 (GET User Not Found)', async ({ request }) => {
        // API Call
        const response = await request.get('https://dummyjson.com/users/300');

        // Validasi Status Code
        expect(response.status(), 'Not Found').toBe(404);
        
        // Validasi Body
        const body = await response.json();
        expect(body).toBeDefined();
        expect(body).toHaveProperty('message');
        expect(body.message).toBeDefined();
        expect(body.message.toLowerCase()).toContain('not found');
    });

    test('TC-007 (DELETE User)', async ({ request }) => {
        // API Call
        // NOTE: Custom DummyJSON endpoint returns 200 even when user is not found
        const response = await request.delete('https://dummyjson.com/c/1dbf-c857-476f-9f6b');

        // Validasi Status Code
        expect(response.status(), 'Sorry User Not Found').toBe(200);
        expect(response.ok()).toBeTruthy();

        // Validasi Body
        const body = await response.json();
        expect(body).toBeDefined();
        expect(body).toHaveProperty('message');
        expect(body.message).toBeDefined();
        expect(body.message.toLowerCase()).toMatch('sorry user not found');
    });

    test('TC-008 (POST Login Failed Invalid Credential)', async ({ request }) => {
        const headerData = {
            'Content-Type' : 'application/json'
        }

        const bodyData = {
                "username": "dani123",
                "password": "SuksesBersama",
                "expiresInMins" : 30 
        }

        // API Call
        const response = await request.post('https://dummyjson.com/users/login', {
            headers : headerData,
            data : bodyData,
        });

        // Validasi Status Code
        expect(response.status(), 'Bad Request').toBe(400);

        // Validasi Body
        const body = await response.json();
        expect(body).toBeDefined();
        expect(body).toHaveProperty('message');
        expect(body.message).toBeDefined();
        expect(body.message.toLowerCase()).toContain('invalid credentials');
    });
});