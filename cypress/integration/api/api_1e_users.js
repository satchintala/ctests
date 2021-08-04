///<reference types = 'Cypress'/>
import { session_token, verification_code, sign_up } from './utility.js'

describe('User', () => {

    const uk_number_1 = Math.floor(7700000000 + Math.random() * 10000000).toString();
    var anon_token, refresh_token, user_id = null;

    var uk_number_2 = Math.floor(7700000000 + Math.random() * 10000000).toString();
    var anon_token2, refresh_token2, user_id2, token2, token3 = null;

    before(() => {
        verification_code(uk_number_1, "GB", "44").then(({ anonymousToken, refreshToken, userId }) => {
            anon_token = anonymousToken;
            refresh_token = refreshToken;
            user_id = userId.toString();
        })

        sign_up(uk_number_2, "GB", "44", '1995-04-15T16:59:11+00:00').then(({ anonymousToken, refreshToken, userId, token }) => {
            anon_token2 = anonymousToken;
            refresh_token2 = refreshToken;
            user_id2 = userId.toString();
            token2 = token;
        })
    });

    //Refresh Token
    it('User - Refresh Token', () => {

        const mutation = `
            mutation($input: RefreshTokenInput!) {
                refreshToken(input: $input) {
                    errors,
                    token
                }
            }`

        cy.request({
            method: "POST",
            url: "/graphql",
            headers: {
                'content_type': 'application/json',
                'accept': 'appliaction/json',
                'authorization': 'Bearer ' + token2
            },
            body: { query: mutation, variables: { input: { refreshToken: refresh_token2 } } }
        })
            .then((response) => {
                expect(response.status).to.eq(200);
                token3 = response.body.data.refreshToken.token;
            })
    })

    //Block User
    it('User - Block', () => {

        const mutation = `
            mutation($input: BlockUserInput!) {
                blockUser(input: $input) {
                    errors,
                    user{
                        id,
                        phoneNumber
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
            body: { query: mutation, variables: { input: { phoneNumber: uk_number_1, countryCode: "GB", prefix: "44" } } }
        })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body.data.blockUser.user.id).to.eq(user_id);
            })
    })

    //Login - Blocked User
    it('Login - Blocked User', () => {

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
                expect(response.body.data.login).to.have.property('status', 'blocked');
                expect(response.body.data.login.errors[0]).to.have.string('User blocked');
            })
    })

    //Deactivate User
    it('User - Deactivate / Delete', () => {

        cy.request({
            method: 'DELETE',
            url: '/v1/users/me',
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + token2
            }
        })
            .then((response) => {
                expect(response.status).to.eq(204);
            })
    })

    //Blocked User - Invalid Token
    it('Login - Blocked User - Invalid Token', () => {

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

    //Deactive User - Invalid Token
    it('User - Deactivate / Delete - Invalid Token', () => {

        cy.request({
            method: 'DELETE',
            url: '/v1/users/me',
            failOnStatusCode: false,
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'Authorization': 'Bearer ' + token2 + 't'
            }
        })
            .then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).contain('Invalid Authorization');
            })
    })
})