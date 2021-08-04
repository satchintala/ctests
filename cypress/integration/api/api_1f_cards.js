///<reference types = 'Cypress'/>
import { session_token, verification_code, sign_up } from './utility.js'

describe('Cards', () => {

    var uk_number_1 = Math.floor(7700000000 + Math.random() * 10000000).toString();
    var anon_token, refresh_token, user_id, login_token = null;

    const adminUrl = 'http://admin-' + Cypress.config().baseUrl.substring(12, 20) + '.dev-bees.com';
    const userName = Cypress.env("admin_userName");
    const password = Cypress.env("admin_password");

    before(() => {

        Cypress.on('uncaught:exception', (err, runnable) => {
            // returning false here prevents Cypress from
            // failing the test
            return false
        });

        sign_up(uk_number_1, "GB", "44", '1995-04-15T16:59:11+00:00').then(({ anonymousToken, refreshToken, userId, token }) => {
            anon_token = anonymousToken;
            refresh_token = refreshToken;
            user_id = userId.toString();
            login_token = token;
        })
    });

    it('Project - Admin', () => {
        cy.visit(adminUrl);
        cy.get("body").then($body => {
            if ($body.text().includes("Hello World!")) {
                cy.logout();
            }
        })
        cy.adlogin(userName, password);

        cy.server();
        cy.route("GET", "/projects").as("projects");

        cy.menuItem("Projects");
        cy.wait("@projects")
            .its("status")
            .should("eq", 200);

        cy.server();
        cy.route("GET", "/projects/new").as("new");

        cy.get('.page-header a:nth-child(4) > span')
            .should("be.visible")
            .click();

        cy.wait("@new")
            .its("status")
            .should("eq", 200);





    })

    /*it('Cards - V8', () => {
        cy.request({
            method: 'GET',
            url: '/v8/cards',
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'authorization': 'Bearer ' + login_token
            },
            qs: {
                'lat': Cypress.env('uk_lat'),
                'lng': Cypress.env('uk_lng')
            }
        })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('status', 'success');
                expect(response.body.data[0].project.name).to.eq('Chocolate');
                expect(response.body.data[1].poll.name).to.eq('Live poll');
                expect(response.body.data[2].project.name).to.eq('Hello world');
            })
    })

    it('Cards - V7', () => {
        cy.request({
            method: 'GET',
            url: '/v7/cards',
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'authorization': 'Bearer ' + login_token
            },
            qs: {
                'lat': Cypress.env('uk_lat'),
                'lng': Cypress.env('uk_lng')
            }
        })
            .then((response) => {
                expect(response.status).to.eq(200);
                expect(response.body).to.have.property('status', 'success');
                expect(response.body.data[0].project.name).to.eq('Chocolate');
                expect(response.body.data[1].poll.name).to.eq('Live poll');
                expect(response.body.data[2].project.name).to.eq('Hello world');
            })
    })

    it('Card - Hide', () => {
        cy.request({
            method: 'POST',
            url: '/v1/cards/pr_1/hide',
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'authorization': 'Bearer ' + login_token
            },
            qs: {
                'lat': Cypress.env('uk_lat'),
                'lng': Cypress.env('uk_lng')
            }
        })
            .then((response) => {
                expect(response.status).to.eq(200);
            })
    })

    it('Card - Show', () => {
        cy.request({
            method: 'POST',
            url: '/v1/cards/pr_1/show',
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'authorization': 'Bearer ' + login_token
            },
            qs: {
                'lat': Cypress.env('uk_lat'),
                'lng': Cypress.env('uk_lng')
            }
        })
            .then((response) => {
                expect(response.status).to.eq(200);
            })
    })

    it('Cards - V6', () => {
        cy.request({
            method: 'GET',
            url: '/v6/cards',
            failOnStatusCode: false,
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'authorization': 'Bearer ' + login_token
            },
            qs: {
                'lat': Cypress.env('uk_lat'),
                'lng': Cypress.env('uk_lng')
            }
        })
            .then((response) => {
                expect(response.status).to.eq(410);
                expect(response.body).to.have.property('status', 'deprecated');
            })
    })

    it('Cards - V5', () => {
        cy.request({
            method: 'GET',
            url: '/v5/cards',
            failOnStatusCode: false,
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'authorization': 'Bearer ' + login_token
            },
            qs: {
                'lat': Cypress.env('uk_lat'),
                'lng': Cypress.env('uk_lng')
            }
        })
            .then((response) => {
                expect(response.status).to.eq(410);
                expect(response.body).to.have.property('status', 'deprecated');
            })
    })

    it('Cards - V4', () => {
        cy.request({
            method: 'GET',
            url: '/v4/cards',
            failOnStatusCode: false,
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'authorization': 'Bearer ' + login_token
            },
            qs: {
                'lat': Cypress.env('uk_lat'),
                'lng': Cypress.env('uk_lng')
            }
        })
            .then((response) => {
                expect(response.status).to.eq(410);
                expect(response.body).to.have.property('status', 'deprecated');
            })
    })

    it('Cards - Invalid Authorization', () => {
        cy.request({
            method: 'GET',
            url: '/v8/cards',
            failOnStatusCode: false,
            headers: {
                'content_type': 'application/json',
                'accept': 'application/json',
                'authorization': 'Bearer ' + login_token + "t"
            },
            qs: {
                'lat': Cypress.env('uk_lat'),
                'lng': Cypress.env('uk_lng')
            }
        })
            .then((response) => {
                expect(response.status).to.eq(401);
                expect(response.body).contain('Invalid Authorization');

            })
    })*/




})