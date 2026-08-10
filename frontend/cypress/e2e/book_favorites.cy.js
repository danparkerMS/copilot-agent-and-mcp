describe('Book Favorites App', () => {
  // generate a random username and password for the e2e tests
  const username = `e2euser${Math.floor(Math.random() * 1000)}`;
  const password = `e2epass${Math.floor(Math.random() * 1000)}`;
  const user = { username, password };

  beforeEach(() => {
    cy.visit('http://localhost:5173');
  });

  it('should allow a new user to register and login', () => {
    cy.contains('Create Account').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#register').click();
    cy.contains('Registration successful! You can now log in.').should('exist');
    // wait for a bit to ensure the success message is visible
    cy.wait(2000);
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.contains(`Hi, ${user.username}`).should('exist');
    cy.contains('Favorites').should('exist');
  });

  it('should show books and allow adding, removing, and re-adding favorites', () => {
    // Login first
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.contains('Books').click();
    cy.contains('h2', 'Books').should('exist');
    cy.get('button').contains('Add to Favorites').first().click();
    cy.get('a#favorites-link').click();
    cy.get('h2').contains('My Favorite Books').should('exist');
    cy.get('button').contains('Remove from Favorites').first().click();
    cy.contains('No favorite books yet.').should('exist');
    cy.contains('Books').click();
    cy.get('button').contains('Add to Favorites').first().click();
    cy.get('a#favorites-link').click();
    cy.get('button').contains('Remove from Favorites').should('exist');
  });

  it('should share a favorite book link and open it when logged out', () => {
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.contains('Books').click();
    cy.get('button').contains('Add to Favorites').first().click();
    cy.get('a#favorites-link').click();

    cy.window().then(win => {
      if (!win.navigator.clipboard) {
        Object.defineProperty(win.navigator, 'clipboard', {
          value: {},
          configurable: true,
        });
      }
      cy.stub(win.navigator.clipboard, 'writeText').as('writeText').resolves();
    });

    cy.get('button[aria-label^="Share"]').first().click();
    cy.contains('Share link copied.').should('exist');
    cy.get('@writeText').should('have.been.calledOnce');
    cy.get('@writeText').then(stub => {
      const shareUrl = stub.firstCall.args[0];
      expect(shareUrl).to.match(/\/books\/[^/]+$/);
      cy.get('button#logout').click();
      cy.visit(shareUrl);
    });
    cy.contains('h2', 'To Kill a Mockingbird').should('exist');
    cy.contains('Sign in').should('exist');
    cy.contains('save this book to your favorites').should('exist');
  });

  it('should logout and protect routes', () => {
    // Login first
    cy.contains('Login').click();
    cy.get('input[name="username"]').type(user.username);
    cy.get('input[name="password"]').type(user.password);
    cy.get('button#login').click();
    cy.get('button#logout').click();
    cy.contains('Login').should('exist');
    cy.visit('http://localhost:5173/books');
    cy.url().should('eq', 'http://localhost:5173/');
  });
});
