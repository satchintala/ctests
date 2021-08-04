///<reference types = 'Cypress' />
import { session_token } from './utility.js'

describe('GraphQL - Login Input', () => {
    const uk_number_1 = Math.floor(7700000000 + Math.random() * 10000000).toString();
    var anon_token = null;

    before(() => {
        session_token().then((anonymousToken) => {
            anon_token = anonymousToken;
        });
    });

    //New User - Input Phone Number (Step 1)
    it('Login Input Mutation', () => {

        const mutation = `
            mutation($input: LoginInput!) {
                login(input: $input) {
                    errors,
                    status,
                    hasVerificationTries
                }
            }`

        cy.request({
            method: 'POST',
            url: '/graphql',
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + anon_token
            },
            body: { query: mutation, variables: { input: { phoneNumber: uk_number_1, countryCode: "GB", prefix: "44" } } }
        })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data.login).to.have.property('status', 'new_user');
                expect(response.body.data.login).to.have.property('hasVerificationTries', true);
            })
    })

    //Login - 1min Validation
    it('Login Input Mutation - Last Signup < 1min Validation', () => {

        const mutation = `
            mutation($input: LoginInput!) {
                login(input: $input) {
                    errors,
                    status,
                    hasVerificationTries
                }
            }`

        cy.request({
            method: 'POST',
            url: '/graphql',
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + anon_token
            },
            body: { query: mutation, variables: { input: { phoneNumber: uk_number_1, countryCode: "GB", prefix: "44" } } }
        })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data.login.errors[0]).to.have.string('last signup try was made less than 1 minute(s) ago');
            })
    })

    //Invalid Token
    it('Login Input Mutation - Invalid Token', () => {

        const mutation = `
            mutation($input: LoginInput!) {
                login(input: $input) {
                    errors,
                    status,
                    hasVerificationTries
                }
            }`

        cy.request({
            method: 'POST',
            url: '/graphql',
            failOnStatusCode: false,
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + anon_token + 't'
            },
            body: { query: mutation, variables: { input: { phoneNumber: uk_number_1, countryCode: "GB", prefix: "44" } } }
        })
            .then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', 'Invalid Authorization');
            })
    })
})