///<reference types = 'Cypress'/>
import { session_token, verification_code } from './utility.js'

describe('GraphQL - SignUp', () => {
    const uk_number_1 = Math.floor(7700000000 + Math.random() * 10000000).toString();
    var anon_token, refresh_token, user_id = null;

    before(() => {
        verification_code(uk_number_1, "GB", "44").then(({ anonymousToken, refreshToken, userId }) => {
            anon_token = anonymousToken;
            refresh_token = refreshToken;
            user_id = userId.toString();
        })
    });

    //New user - Signup (Step 3)
    it('Login - SignUp - New User', () => {

        const mutation = `
            mutation($input: SignupInput!) {
                signup(input: $input) {
                    errors,
                    token,
                    user{
                        id,
                        consents{
                            consentCode,
                            status
                        }
                    }
                }
            }`

        cy.request({
            method: "POST",
            url: "/graphql",
            headers: {
                'content_type': 'application/json',
                'accept': 'appliaction/json',
                'authorization': 'Bearer ' + anon_token
            },
            body: { query: mutation, variables: { input: { phoneNumber: uk_number_1, countryCode: "GB", prefix: "44", termsAgreed: true, marketingAgreed: true, parentalConsentAgreed: true, dateOfBirth: "2006-06-18T14:59:11+00:00" } } }
        })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data.signup.user.id).to.eq(user_id);
            })
    })

    //Sign in - Existing User
    it('Login - SignUp - Existing User', () => {

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

    //Invalid Token
    it('Login - SignUp - Invalid Token', () => {

        const mutation = `
            mutation($input: SignupInput!) {
                signup(input: $input) {
                    errors,
                    token,
                    user{
                        id,
                        consents{
                            consentCode,
                            status
                        }
                    }
                }
            }`

        cy.request({
            method: "POST",
            url: "/graphql",
            failOnStatusCode: false,
            headers: {
                'content_type': 'application/json',
                'accept': 'appliaction/json',
                'authorization': 'Bearer ' + anon_token + 't'
            },
            body: { query: mutation, variables: { input: { phoneNumber: uk_number_1, countryCode: "GB", prefix: "44", termsAgreed: true, marketingAgreed: true, parentalConsentAgreed: true, dateOfBirth: "2006-06-18T14:59:11+00:00" } } }
        })
            .then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', 'Invalid Authorization');
            })
    })

})