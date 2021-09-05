/* istanbul ignore file */

const { createContainer } = require('instances-container');

// external agency
const { nanoid } = require('nanoid');
const bcrypt = require('bcrypt');
const pool = require('./database/postgres/pool');

// service (repository, helper, manager, etc)
const UserRepositoryPostgres = require('./repository/UserRepositoryPostgres');
const BcryptEncryptionHelper = require('./security/BcryptEncryptionHelper');

// use case
const AddUserUseCase = require('../Applications/use_case/AddUserUseCase');
const UserRepository = require('../Domains/users/UserRepository');
const EncryptionHelper = require('../Applications/security/EncryptionHelper');

// creating container
const container = createContainer();

// registering services and repository
container.register([
  {
    key: UserRepository.name,
    Class: UserRepositoryPostgres,
    parameter: {
      dependencies: [
        {
          concrete: pool,
        },
        {
          concrete: nanoid,
        },
      ],
    },
  },
  {
    key: EncryptionHelper.name,
    Class: BcryptEncryptionHelper,
    parameter: {
      dependencies: [
        {
          concrete: bcrypt,
        },
      ],
    },
  },
]);

// registering use cases
container.register([
  {
    key: AddUserUseCase.name,
    Class: AddUserUseCase,
    parameter: {
      injectType: 'destructuring',
      dependencies: [
        {
          name: 'userRepository',
          internal: UserRepository.name,
        },
        {
          name: 'encryptionHelper',
          internal: EncryptionHelper.name,
        },
      ],
    },
  },
]);

module.exports = container;
