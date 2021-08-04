///<reference types = 'Cypress'/>
import { session_token, verification_code } from './utility.js'

describe('GraphQL - Verification Code', () => {
    const uk_number_1 = Math.floor(7700000000 + Math.random() * 10000000).toString();
    var anon_token = null;

    before(() => {
        session_token().then((anonymousToken) => {
            anon_token = anonymousToken;
        });
    });

    //New User - Verification Code (Step 2)
    it('Login - Verification Code', () => {
        cy.loginInput(uk_number_1, "GB", "44", anon_token);

        const mutation = `
            mutation($input: VerificationCodeInput!) {
                verificationCode(input: $input) {
                    errors,
                    token,
                    refreshToken,
                    verifySuccess,
                    userId
                }
            }`

        cy.request({
            method: 'POST',
            url: '/graphql',
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'authorization': 'Bearer ' + anon_token
            },
            body: { query: mutation, variables: { input: { phoneNumber: uk_number_1, countryCode: "GB", prefix: "44", code: Cypress.env("verification_code") } } }
        })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data.verificationCode).to.have.property('verifySuccess', true);
            })
    })

    //Invalid Verification Code
    it('Login - Invalid Verification Code', () => {

        const mutation = `
            mutation($input: VerificationCodeInput!) {
                verificationCode(input: $input) {
                    errors,
                    token,
                    refreshToken,
                    verifySuccess,
                    userId
                }
            }`

        cy.request({
            method: 'POST',
            url: '/graphql',
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'authorization': 'Bearer ' + anon_token
            },
            body: { query: mutation, variables: { input: { phoneNumber: uk_number_1, countryCode: "GB", prefix: "44", code: "833334" } } }
        })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data.verificationCode.errors[0]).to.have.string('Verification code does not match or has expired');
            })
    })

    //Invalid Token
    it('Login - Invalid Token', () => {

        const mutation = `
            mutation($input: VerificationCodeInput!){
                verificationCode(input: $input) {
                    errors,
                    token,
                    refreshToken,
                    verifySucess,
                    userId
                }
            }`

        cy.request({
            method: 'POST',
            url: '/graphql',
            failOnStatusCode: false,
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'authorization': 'Bearer ' + anon_token + 't'
            },
            body: { query: mutation, vaiables: { input: { phoneNumber: uk_number_1, countryCode: "GB", prefix: "44", code: Cypress.env("verification_code") } } }
        })
            .then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', 'Invalid Authorization');
            })
    })
})