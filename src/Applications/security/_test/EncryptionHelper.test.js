const EncryptionHelper = require('../EncryptionHelper');

describe('EncryptionHelper interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    const encryptionHelper = new EncryptionHelper();

    await expect(encryptionHelper.encryptPassword('dummy_password')).rejects.toThrowError('ENCRYPTION_HELPER.METHOD_NOT_IMPLEMENTED');
    await expect(encryptionHelper.comparePassword('plain', 'encrypted')).rejects.toThrowError('ENCRYPTION_HELPER.METHOD_NOT_IMPLEMENTED');
  });
});
