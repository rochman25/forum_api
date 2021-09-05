const AuthenticationRepositoryPostgres = require('../AuthenticationRepositoryPostgres');
const AuthenticationsTableTestHelper = require('../../../../tests/AuthenticationsTableTestHelper');
const pool = require('../../database/postgres/pool');
const InvariantError = require('../../../Commons/exceptions/InvariantError');

describe('AuthenticationRepositoryPostgres', () => {
  it('should be instance of AuthenticationRepository domain', () => {
    const authenticationRepositoryPostgres = new AuthenticationRepositoryPostgres();
    expect(authenticationRepositoryPostgres).toBeInstanceOf(AuthenticationRepositoryPostgres);
  });

  describe('behavior test', () => {
    afterEach(async () => {
      await AuthenticationsTableTestHelper.cleanTable();
    });

    afterAll(async () => {
      await pool.end();
    });

    describe('addToken function', () => {
      it('should add token to database', async () => {
        const authenticationRepository = new AuthenticationRepositoryPostgres(pool);
        const token = 'token';

        // Action
        await authenticationRepository.addToken(token);

        // Assert
        const tokens = await AuthenticationsTableTestHelper.findToken(token);
        expect(tokens).toHaveLength(1);
        expect(tokens[0].token).toBe(token);
      });
    });
  });
});
