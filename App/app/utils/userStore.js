// /home/danish/PROJECT/App/app/utils/userStore.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const addUser = async (email, password, fullName) => {
  try {
    const usersJSON = await AsyncStorage.getItem('users');
    const users = usersJSON ? JSON.parse(usersJSON) : [];

    const userExists = users.some((u) => u.email.toLowerCase() === email.toLowerCase());
    if (userExists) {
      return false;
    }

    const newUser = { email, password, fullName };
    users.push(newUser);
    await AsyncStorage.setItem('users', JSON.stringify(users));
    return true;
  } catch (error) {
    console.error('Error adding user:', error);
    return false;
  }
};

export default { addUser };