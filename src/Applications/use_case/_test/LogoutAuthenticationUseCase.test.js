const AuthenticationRepository = require('../../../Domains/authentications/AuthenticationRepository');
const LogoutAuthenticationUseCase = require('../LogoutAuthenticationUseCase');

describe('GetAuthenticationUseCase', () => {
  it('should throw error if use case payload not contain refresh token', async () => {
    // Arrange
    const useCasePayload = {};
    const logoutAuthenticationUseCase = new LogoutAuthenticationUseCase({});

    // Action & Assert
    await expect(logoutAuthenticationUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN');
  });

  it('should throw error if refresh token not string', async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: 1,
    };
    const logoutAuthenticationUseCase = new LogoutAuthenticationUseCase({});

    // Action & Assert
    await expect(logoutAuthenticationUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should orchestrating the delete authentication action correctly', async () => {
    // Arrange
    const useCasePayload = {
      refreshToken: 'refreshToken',
    };
    const mockAuthenticationRepository = new AuthenticationRepository();
    mockAuthenticationRepository.checkAvailabilityToken = jest.fn()
      .mockImplementation(() => Promise.resolve());
    mockAuthenticationRepository.deleteToken = jest.fn()
      .mockImplementation(() => Promise.resolve());

    const logoutAuthenticationUseCase = new LogoutAuthenticationUseCase({
      authenticationRepository: mockAuthenticationRepository,
    });

    // Act
    await logoutAuthenticationUseCase.execute(useCasePayload);

    // Assert
    expect(mockAuthenticationRepository.checkAvailabilityToken)
      .toHaveBeenCalledWith(useCasePayload.refreshToken);
    expect(mockAuthenticationRepository.deleteToken)
      .toHaveBeenCalledWith(useCasePayload.refreshToken);
  });
});
