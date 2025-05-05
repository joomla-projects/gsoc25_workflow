describe('Test that console command user', () => {
  it('can list users', () => {
    cy.exec(`php ${Cypress.env('cmsPath')}/cli/joomla.php user:list`)
      .its('stdout')
      .should('contain', `${Cypress.env('username')}`);
  });

  it('can add a user', () => {
    const para = '--username=test --name=test --password=123456789012 --email=test@530.test --usergroup=Manager -n';
    cy.exec(`php ${Cypress.env('cmsPath')}/cli/joomla.php user:add ${para}`)
      .its('stdout')
      .should('contain', 'User created!');
    cy.db_shouldContain('users', { username: 'test', name: 'test', email: 'test@530.test' });
    cy.task('queryDB', "SELECT g.* FROM #__usergroups g join #__user_usergroup_map m on g.id = m.group_id join #__users u on u.id = m.user_id where u.username = 'test'").then((group) => {
      cy.wrap(group).should('have.length', 1);
      cy.wrap(group[0].title).should('be.equal', 'Manager');
    });
  });

  it('can reset password', () => {
    const para = '--username=test --password=abcdefghilmno -n';
    cy.exec(`php ${Cypress.env('cmsPath')}/cli/joomla.php user:reset-password ${para}`)
      .its('stdout')
      .should('contain', 'Password changed!');
  });

  it('can reset password with user argument', () => {
    cy.db_enableExtension('1', 'plg_actionlog_joomla');
    cy.task('queryDB', 'TRUNCATE #__action_logs');

    const para = `--username=test --password=abcdefghilmno --user=${Cypress.env('username')} -n`;
    cy.exec(`php ${Cypress.env('cmsPath')}/cli/joomla.php user:reset-password ${para}`)
      .its('stdout')
      .should('contain', 'Password changed!');
    cy.db_shouldContain('action_logs', { message_language_key: 'PLG_SYSTEM_ACTIONLOGS_CONTENT_UPDATED' });
  });

  it('can add a user to user group', () => {
    const para = '--username=test --group=Registered -n';
    cy.exec(`php ${Cypress.env('cmsPath')}/cli/joomla.php user:addtogroup ${para}`)
      .its('stdout')
      .should('contain', "Added 'test' to group 'Registered'!");
    cy.task('queryDB', "SELECT g.* FROM #__usergroups g join #__user_usergroup_map m on g.id = m.group_id join #__users u on u.id = m.user_id where u.username = 'test'").then((group) => {
      cy.wrap(group).should('have.length', 2)
        .then((list) => Cypress._.map(list, 'title'))
        .should('include', 'Manager')
        .should('include', 'Registered');
    });
  });

  it('can remove a user from user group', () => {
    const para = '--username=test --group=Registered -n';
    cy.exec(`php ${Cypress.env('cmsPath')}/cli/joomla.php user:removefromgroup ${para}`)
      .its('stdout')
      .should('contain', "Removed 'test' from group 'Registered'!");
    cy.task('queryDB', "SELECT g.* FROM #__usergroups g join #__user_usergroup_map m on g.id = m.group_id join #__users u on u.id = m.user_id where u.username = 'test'").then((group) => {
      cy.wrap(group).should('have.length', 1);
      cy.wrap(group[0].title).should('be.equal', 'Manager');
    });
  });

  it('can delete a user', () => {
    const para = '--username=test -n';
    cy.exec(`php ${Cypress.env('cmsPath')}/cli/joomla.php user:delete ${para}`)
      .its('stdout')
      .should('contain', 'User test deleted!');
    cy.db_shouldNotContain('users', { username: 'test' });
  });
});
