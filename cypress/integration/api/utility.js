///<reference types = 'Cypress' />

//Anonymous Token
function session_token() {
    return cy.request({
        method: 'GET',
        url: '/v1/api/token',
        qs: {
            'application_key': Cypress.env('iOS_key')
        }
    })
        .then((response) => {
            const anonymousToken = response.body.data.token;
            return Promise.resolve(anonymousToken);
            //return anonymousToken;
        })
}

//Verification Code
function verification_code(phone_number, code, prefix) {
    return cy.request({
        method: 'GET',
        url: '/v1/api/token',
        qs: {
            'application_key': Cypress.env('iOS_key')
        }
    })
        .then((response) => {
            const anonymousToken = response.body.data.token;

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
                    'Authorization': 'Bearer ' + anonymousToken
                },
                body: { query: mutation, variables: { input: { phoneNumber: phone_number, countryCode: code, prefix: prefix } } }
            })
                .then((response) => {

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
                            'authorization': 'Bearer ' + anonymousToken
                        },
                        body: { query: mutation, variables: { input: { phoneNumber: phone_number, countryCode: "GB", prefix: "44", code: Cypress.env("verification_code") } } }
                    })
                        .then((response) => {
                            const refreshToken = response.body.data.verificationCode.refreshToken;
                            const userId = response.body.data.verificationCode.userId;
                            return { anonymousToken, refreshToken, userId };
                        })
                })
        })
}

//Sign up - New User
function sign_up(phone_number, code, prefix, dob) {
    return cy.request({
        method: 'GET',
        url: '/v1/api/token',
        qs: {
            'application_key': Cypress.env('iOS_key')
        }
    })
        .then((response) => {
            const anonymousToken = response.body.data.token;

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
                    'Authorization': 'Bearer ' + anonymousToken
                },
                body: { query: mutation, variables: { input: { phoneNumber: phone_number, countryCode: code, prefix: prefix } } }
            })
                .then((response) => {

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
                            'authorization': 'Bearer ' + anonymousToken
                        },
                        body: { query: mutation, variables: { input: { phoneNumber: phone_number, countryCode: "GB", prefix: "44", code: Cypress.env("verification_code") } } }
                    })
                        .then((response) => {
                            const refreshToken = response.body.data.verificationCode.refreshToken;
                            const userId = response.body.data.verificationCode.userId;

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
                                    'authorization': 'Bearer ' + anonymousToken
                                },
                                body: { query: mutation, variables: { input: { phoneNumber: phone_number, countryCode: "GB", prefix: "44", termsAgreed: true, marketingAgreed: true, dateOfBirth: dob } } }
                            })
                                .then((response) => {
                                    const token = response.body.data.signup.token;
                                    return { anonymousToken, refreshToken, userId, token };
                                })
                        })
                })
        })
}


export { session_token, verification_code, sign_up };