const AddThread = require('../AddThread');

describe('a AddThread entities', () => {
  it('should throw error when payload did not contain needed property', () => {
    const payload = {
      title: 'abc',
      owner: 'user-123',
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload did not meet data type specification', () => {
    const payload = {
      title: 123,
      body: true,
      owner: 'user-123',
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should throw error when title contains more than 250 character', () => {
    const payload = {
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Vel risus commodo viverra maecenas accumsan lacus vel. Consequat interdum varius sit amet mattis vulputate enim nulla. Sit amet aliquam id diam maecenas. Ut etiam sit amet nisl purus. Suscipit adipiscing bibendum est ultricies integer quis.',
      body: 'Dicoding Indonesia',
      owner: 'user-123',
    };

    expect(() => new AddThread(payload)).toThrowError('ADD_THREAD.TITLE_LIMIT_CHAR');
  });

  it('should create new thread object correctly', () => {
    const payload = {
      title: 'sebuah thread',
      body: 'Dicoding Indonesia',
      owner: 'user-123',
    };

    const { title, body, owner } = new AddThread(payload);

    expect(title).toEqual(payload.title);
    expect(body).toEqual(payload.body);
    expect(owner).toEqual(payload.owner);
  });
});
