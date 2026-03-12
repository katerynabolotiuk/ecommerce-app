const { User } = require('../../src/models');
const userController = require('../../src/controllers/userController');
const { mockDeep } = require('jest-mock-extended');

jest.mock('../../src/models');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    req = {};
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const fakeUser = { id: 1, firstName: 'John' };
      req.body = { firstName: 'John' };
      User.create.mockResolvedValue(fakeUser);

      await userController.createUser(req, res);

      expect(User.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(fakeUser);
    });

    it('should handle errors', async () => {
      User.create.mockRejectedValue(new Error('Invalid data'));
      req.body = {};

      await userController.createUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid data' });
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [{ id: 1 }];
      User.findAll.mockResolvedValue(users);

      await userController.getAllUsers(req, res);

      expect(res.json).toHaveBeenCalledWith(users);
    });
  });

  describe('getUserById', () => {
    it('should return user if found', async () => {
      const user = { id: 1 };
      req.params = { id: 1 };
      User.findByPk.mockResolvedValue(user);

      await userController.getUserById(req, res);

      expect(User.findByPk).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith(user);
    });

    it('should return 404 if not found', async () => {
      req.params = { id: 1 };
      User.findByPk.mockResolvedValue(null);

      await userController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('updateUser', () => {
    it('should update user if found', async () => {
      const user = mockDeep();
      user.update.mockResolvedValue({ id: 1, firstName: 'Updated' });
      req.params = { id: 1 };
      req.body = { firstName: 'Updated' };
      User.findByPk.mockResolvedValue(user);

      await userController.updateUser(req, res);

      expect(user.update).toHaveBeenCalledWith(req.body);
      expect(res.json).toHaveBeenCalledWith({ id: 1, firstName: 'Updated' });
    });

    it('should return 404 if not found', async () => {
      req.params = { id: 1 };
      req.body = { firstName: 'Updated' };
      User.findByPk.mockResolvedValue(null);

      await userController.updateUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });

  describe('deleteUser', () => {
    it('should delete user if found', async () => {
      const user = mockDeep();
      user.destroy.mockResolvedValue();
      req.params = { id: 1 };
      User.findByPk.mockResolvedValue(user);

      await userController.deleteUser(req, res);

      expect(user.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ message: 'User deleted' });
    });

    it('should return 404 if not found', async () => {
      req.params = { id: 1 };
      User.findByPk.mockResolvedValue(null);

      await userController.deleteUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'User not found' });
    });
  });
});