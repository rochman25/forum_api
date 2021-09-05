const UserLogin = require('../UserLogin');

describe('UserLogin entities', () => {
  it('should throw error when payload not contain needed property', () => {
    const payload = {
      username: 'dicoding',
    };

    expect(() => new UserLogin(payload)).toThrowError('USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      username: '123',
      password: 123,
    };

    expect(() => new UserLogin(payload)).toThrowError('USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create UserLogin entities correctly', () => {
    const payload = {
      username: 'dicoding',
      password: 'abc',
    };

    const { username, password } = new UserLogin(payload);

    expect(username).toEqual(payload.username);
    expect(password).toEqual(payload.password);
  });
});
