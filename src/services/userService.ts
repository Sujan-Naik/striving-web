import User, {IUser} from '@/models/User';

export class UserServiceClass {
  // Create user
  async createUser(userData: Partial<IUser>) {
    return User.findOneAndUpdate(
        {email: userData.email},
        userData,
        {upsert: true, new: true}
    );
  }

  // Find user by GitHub ID
  async findByGithubId(githubId: string) {
    return await User.findOne({ githubId });
  }

  // Find user by ID
  async findById(id: string) {
    return await User.findById(id);
  }

  // Update user
  async updateUser(id: string, updates: Partial<IUser>) {
    return await User.findByIdAndUpdate(id, updates, { new: true });
  }

  // Delete user
  async deleteUser(id: string) {
    return await User.findByIdAndDelete(id);
  }

  // Get all users
  async getAllUsers() {
    return await User.find();
  }
}

const userService = new UserServiceClass();
export default userService;