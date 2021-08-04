/// <reference types = 'Cypress' />

describe('Anonymous Token', () => {
    //Anonymous Token - iOS
    it('Authorization Token - Anonymous - iOS', () => {
        cy.request({
            method: 'GET',
            url: '/v1/api/token',
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json'
            },
            qs: {
                'application_key': Cypress.env('iOS_key')
            }
        })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('status', 'success');
                expect(response.body).to.have.property('message', '');
                Cypress.env({ anon_token: response.body.data.token });
            })
    })

    //Anonymous Token - Android
    it('Authorization Token - Anonymous - Andriod', () => {
        cy.request({
            method: 'GET',
            url: '/v1/api/token',
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json'
            },
            qs: {
                'application_key': Cypress.env('android_key')
            }
        })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('status', 'success');
                expect(response.body).to.have.property('message', '');
                Cypress.env({ anon_token: response.body.data.token });
            })
    })

    //Invalid Application Key
    it('Authorization Token - Invalid Application Key', () => {
        cy.request({
            method: "GET",
            url: '/v1/api/token',
            failOnStatusCode: false,
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json'
            },
            qs: {
                'application_key': Cypress.env('iOS_Key') + 't'
            }
        })
            .then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).to.have.property('message', 'invalid application_key');
            })
    })

})