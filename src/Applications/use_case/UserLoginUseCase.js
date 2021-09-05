const NewAuth = require('../../Domains/authentications/entities/NewAuth');
const UserLogin = require('../../Domains/users/entities/UserLogin');

class UserLoginUseCase {
  constructor({
    userRepository,
    authenticationRepository,
    authenticationTokenManager,
    encryptionHelper,
  }) {
    this._userRepository = userRepository;
    this._authenticationRepository = authenticationRepository;
    this._authenticationTokenManager = authenticationTokenManager;
    this._encryptionHelper = encryptionHelper;
  }

  async execute(useCasePayload) {
    const { username, password } = new UserLogin(useCasePayload);

    const encryptedPassword = await this._userRepository.getPasswordByUsername(username);

    await this._encryptionHelper.comparePassword(password, encryptedPassword);

    const id = await this._userRepository.getIdByUsername(username);

    const accessToken = await this._authenticationTokenManager
      .createAccessToken({ username, id });
    const refreshToken = await this._authenticationTokenManager
      .createRefreshToken({ username, id });

    const newAuth = new NewAuth({
      accessToken,
      refreshToken,
    });

    await this._authenticationRepository.addToken(newAuth.refreshToken);
    return newAuth;
  }
}

module.exports = UserLoginUseCase;
