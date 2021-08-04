// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

//B2C APIs COMMANDS
//Login Input 
Cypress.Commands.add('loginInput', (phone_number, code, prefix, anon_token) => {

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
    body: { query: mutation, variables: { input: { phoneNumber: phone_number, countryCode: code, prefix: prefix } } }
  })
    .then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.data.login).to.have.property('status', 'new_user');
      expect(response.body.data.login).to.have.property('hasVerificationTries', true);
    })
})


//STREETBEES ADMIN

//Login
Cypress.Commands.add("adlogin", (userName, password) => {
  cy.get("input#email").type(userName);
  cy.get("input#password").type(password);
  cy.get('input[type="submit"]').click();
});

//Logout
Cypress.Commands.add("logout", () => {
  cy.get("a.logout")
    .should("be.visible")
    .click();
  cy.url().should("include", "/admins/sign_in");
});

//Navigate to a Menu Item
Cypress.Commands.add("menuItem", option => {
  cy.get("ul.dropdown-menu li a")
    .should("contain", option)
    .contains(option)
    .click({ force: true });
  cy.wait(500);
});

//Main Menu
Cypress.Commands.add("mainMenu", option => {
  cy.get("ul.nav li a")
    .should("contain", option)
    .contains(option)
    .click({ force: true });
  cy.wait(500);
});


//Add New Project
Cypress.Commands.add("newProject", (name, projType, selector) => {
  cy.server();
  cy.route("GET", "/projects/new").as("new");
  //cy.get('a[href="/projects/new"]')
  cy.get('.page-header a:nth-child(3) > span')
    .should("be.visible")
    .click();
  cy.get("div.col-md-12")
    .first()
    .should("be.visible");

  const slug = "slug_" + name;
  Cypress.env({ slug: slug });
  const proj_code = "TEST1234";
  Cypress.env({ proj_code: proj_code });
  const internal_ref = "Test Project";
  Cypress.env({ internal_ref: internal_ref });

  cy.get("input#project_name")
    .should("be.visible")
    .type(name);
  cy.get("input#project_slug")
    .should("be.visible")
    .type(slug);
  cy.get("input#project_summary")
    .should("be.visible")
    .type("Tell us more about your habits!");
  cy.get("textarea#project_description")
    .should("be.visible")
    .type("Tell us more about your habits!");
  cy.get("input#project_high_priority")
    .should("be.visible")
    .click();
  cy.chooseCode("#react-select-2--value .Select-input", proj_code);
  cy.get("input#project_internal_ref")
    .should("be.visible")
    .type(internal_ref);
  cy.chooseReactSelectOption(selector, projType, projType);
  cy.get("#disable_appending").click();

  cy.upload_image("../fixtures/thirsty.png", "input#project_image");
  cy.get("input#project_duration_time").type("3");
  cy.get("input#project_restricted_clients")
    .first()
    .click();
  cy.get("button#project-save-button").click();
  cy.wait("@new")
    .its("status")
    .should("eq", 200);
  cy.get(".alert").should("contain", "Project was successfully created");
  cy.get("table.table tbody>tr")
    .eq(0)
    .find("td")
    .eq(5)
    .should("be.visible")
    .and("contain", name);
  cy.get("table.table tbody>tr")
    .eq(0)
    .find("td")
    .eq(3)
    .should("be.visible")
    .and("contain", proj_code);
  cy.get("table.table tbody>tr")
    .eq(0)
    .find("td")
    .eq(4)
    .should("be.visible")
    .and("contain", internal_ref);
});

//Project Code
Cypress.Commands.add("projCode", (selector, text, option) => {
  cy.get(`${selector} input`)
    .first()
    .click({ force: true })
    .type(text, { force: true })
    .get(".select2-results__options")
    .contains(option)
    .click();
});

Cypress.Commands.add("chooseCode", (selector, text) => {
  cy.get(`${selector} input`)
    .first()
    .click({ force: true })
    .type(text + "{enter}", { force: true });
});

//Project Search - Name
Cypress.Commands.add("projNameSearch", projName => {
  cy.get("input#q_name_cont")
    .clear()
    .type(projName);
  cy.get('input[name="commit"]').click();

  cy.get("table.table tbody tr").each($tr => {
    cy.wrap($tr)
      .invoke("show")
      .find("td")
      .eq(5)
      .contains(projName);
    cy.wait(1000);
  });
});

//Project - Open
Cypress.Commands.add("projOpen", () => {
  cy.get('.table').contains('td>a', 'Edit').then(elem => {
    cy.get(elem).click()
  })
});

//Get Project Id
Cypress.Commands.add("projId", (projName) => {
  cy.menuItem("Projects");
  cy.projNameSearch(projName);
  return cy.get("table.table tbody tr td:nth-child(2)").invoke("text");
});

//Project - select
Cypress.Commands.add("projSelect", () => {
  cy.get(".table tbody tr:first")
    .find("td input")
    .click();
  cy.get("#open_bulk_actions_modal_link")
    .should("be.enabled")
    .click();
});

//Statistics
Cypress.Commands.add("statistics", (selector) => {
  cy.get(selector).find('.form-group #attributes_start_date')
    .type(new Date().getFullYear() + '-01-01')
  cy.get(selector).find('.form-group #attributes_end_date').click()
    .type(new Date().getFullYear() + '-12-31')
  cy.get(selector + ' h4').click()
  cy.get(selector).find('form input[type="submit"]').click()
  cy.get('.alert h4').should('contain', 'Report is generating, it will be sent to your email when done!')
})

//Add Quota
Cypress.Commands.add("addQuota", (selector, code, location) => {
  cy.get("button.btn-sm").click();
  cy.get(".modal-body .form-group:nth-child(1)>input").type(code);
  cy.get(".modal-body .form-group:nth-child(2)>input").type(location);
  cy.chooseReactSelectOption(selector, location, location);
  cy.get(".modal-footer:first button.btn-primary").click();

  cy.get("table.table tbody tr").within($td => {
    cy.get("div>h4")
      .contains(code)
      .get("td .location-quota-area .rest-counter")
      .click();
  });

  cy.get(".modal-extra-large.modal-dialog input#project_total_quota").type(20);
  cy.get(".modal-extra-large.modal-dialog .modal-footer button")
    .contains("Save")
    .click();
});

//Add Gate
Cypress.Commands.add("addGate", (operator, value) => {
  cy.get("td .location-quota-area .rest-counter").click();
  cy.get(".modal-extra-large.modal-dialog .quota-list button")
    .first()
    .click();
  cy.get(".modal-extra-large.modal-dialog .quota-rule .qr-operator select")
    .select(operator)
    .should("have.value", operator);
  cy.get(".modal-extra-large.modal-dialog .quota-rule .qr-value input")
    .type(value)
    .should("have.value", value);
  cy.get(".modal-extra-large.modal-dialog .modal-footer button")
    .contains("Save")
    .click();
});

//Edit Gate
Cypress.Commands.add("editGate", (operator, value) => {
  cy.get("td .location-quota-area .rest-counter").click();
  //cy.get('.modal-extra-large.modal-dialog .quota-list button').first().click()
  cy.get(".modal-extra-large.modal-dialog .quota-rule .qr-operator select")
    .select(operator)
    .should("have.value", operator);
  cy.get(".modal-extra-large.modal-dialog .quota-rule .qr-value input")
    .clear()
    .type(value)
    .should("have.value", value);
  cy.get(".modal-extra-large.modal-dialog .modal-footer button")
    .contains("Save")
    .click();
});

//Add Rule
Cypress.Commands.add("addRule", () => {
  cy.get("td .location-quota-area .rest-counter").click();
  cy.get(".modal-extra-large.modal-dialog .quota-list button:nth-child(5)")
    .click();
  cy.get(".quota-list .quota-rule .qr-quantity input").clear().type(10)
  cy.get(".quota-list div:nth-child(4) .quota-rule button:nth-child(4)").click()
  cy.get(".quota-list div:nth-child(4) .quota-rule .qr-nested .quota-rule .qr-quantity input").clear().type(10)

  cy.get(".quota-list div:nth-child(4) .quota-rule .qr-nested .quota-rule .qr-type select").select('age')
    .should('have.value', 'age')

  cy.get(".quota-list button:nth-child(5)").contains("Add").click()
  cy.get(".quota-list  div:nth-child(4) div:nth-child(3) > div.qr-quantity input").clear().type(10)
  cy.get(".quota-list div:nth-child(4) div:nth-child(3) div:nth-child(2) > div.qr-value > select")
    .select("female").should('have.value', 'female')
  cy.get(".quota-list div:nth-child(4) div:nth-child(3) button:nth-child(4)").contains('Add').click()
  cy.get(".quota-list div:nth-child(4) div:nth-child(3) div.qr-nested .quota-rule div.qr-quantity input")
    .clear().type(10)
  cy.get(".quota-list div:nth-child(4) div:nth-child(3) div.qr-nested .quota-rule div:nth-child(2) div.qr-type select")
    .select("age").should('have.value', 'age')
  cy.get(".modal-extra-large.modal-dialog .modal-footer button")
    .contains("Save")
    .click();
});


//FILE UPLOAD
Cypress.Commands.add("upload_file", (fileName, selector) => {
  return cy.get(selector).then(subject => {
    return cy
      .fixture(fileName, "base64")
      .then(Cypress.Blob.base64StringToBlob)
      .then(blob => {
        const el = subject[0];
        const testFile = new File([blob], fileName, {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(testFile);
        el.files = dataTransfer.files;
        return subject;
      });
  });
});

//IMAGE UPLOAD
Cypress.Commands.add("upload_image", (fileUrl, selector) => {
  return cy.get(selector).then(subject => {
    return cy
      .fixture(fileUrl, "base64")
      .then(Cypress.Blob.base64StringToBlob)
      .then(blob => {
        return cy.window().then(win => {
          const el = subject[0];
          const nameSegments = fileUrl.split("/");
          const name = nameSegments[nameSegments.length - 1];
          const testFile = new win.File([blob], name, { type: "image/png" });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(testFile);
          el.files = dataTransfer.files;
          return subject;
        });
      });
  });
});

//REACT SELECT
Cypress.Commands.add("chooseReactSelectOption", (selector, text, option) => {
  cy.get(`${selector} input`)
    .first()
    .click({ force: true })
    .type(text, { force: true })
    .get(".Select-menu-outer")
    .contains(option)
    .click();
});

//Scroll
Cypress.Commands.add("scrollMacro", (navText, elementId, offset) => {
  cy.contains(".searchQuestionList", navText)
    .click({ force: true })
    .wait(1200)
    .contains(".searchQuestionList", navText)
    .parent()
    .should("have.class", "questionsSearchList-body")
    .get(elementId)
    .then(ele => {
      cy.get("body")
        .should("have.prop", "scrollTop")
        .and("equal", ele[0].offsetTop - offset);
    });
});

//Cards end point for quota
Cypress.Commands.add("cards", (phoneNumber, code, prefix) => {
  return cy
    .request({
      method: "GET",
      url: Cypress.env("test_baseurl") + "/v1/api/token",
      headers: {
        "content-type": "application/json",
        accept: "application/json"
      },
      qs: {
        application_key: Cypress.env("iOS_key")
      }
    })
    .then(response => {
      const anon_token = response.body.data.token;
      //cy.log(anon_token)
      cy.request({
        method: "POST",
        url: Cypress.env("test_baseurl") + "/v2/users/login",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          authorization: "Bearer " + anon_token //Cypress.env('anon_token')
        },
        body: {
          user: {
            phone_number_country_code: code,
            phone_number_prefix: prefix,
            phone_number: phoneNumber,
            password: "123456789"
          }
        }
      });
    })
    .then(response => {
      const token = response.body.data.token;
      cy.request({
        method: "GET",
        url: Cypress.env("test_baseurl") + "/v7/cards",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          authorization: "Bearer " + token //Cypress.env('login_token')
        },
        qs: {
          lat: Cypress.env("lon_latitue"),
          lng: Cypress.env("lon_longitude")
        }
      });
    });
});

//Bulk answer 
Cypress.Commands.add("submission", (phoneNumber, code, prefix) => {
  return cy
    .request({
      method: "GET",
      url: Cypress.env("test_baseurl") + "/v1/api/token",
      headers: {
        "content-type": "application/json",
        accept: "application/json"
      },
      qs: {
        application_key: Cypress.env("iOS_key")
      }
    })
    .then(response => {
      const anon_token = response.body.data.token;
      cy.request({
        method: "POST",
        url: Cypress.env("test_baseurl") + "/v2/users/login",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          authorization: "Bearer " + anon_token //Cypress.env('anon_token')
        },
        body: {
          user: {
            phone_number_country_code: code,
            phone_number_prefix: prefix,
            phone_number: phoneNumber,
            password: "123456789"
          }
        }
      });
    })
    .then(response => {
      const token = response.body.data.token;
      cy.request({
        method: "POST",
        url: Cypress.env("test_baseurl") + "/v3/projects/" + proj,
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          authorization: "Bearer " + token //Cypress.env('login_token')
        },
        qs: {
          lat: Cypress.env("lon_latitue"),
          lng: Cypress.env("lon_longitude")
        }
      });
    });
})
