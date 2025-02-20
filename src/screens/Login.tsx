import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
} from 'react-native';
import React, {useState} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {useDispatch, useSelector} from 'react-redux';
import {setUser} from '../features/slices/userSlice';
import SimpleToast from 'react-native-simple-toast';

const Login = ({navigation}) => {
  const [currState, setCurrState] = useState('Login');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // if true, button is disabled and TextInputs are not editable

  const defaultAvatar =
    'https://firebasestorage.googleapis.com/v0/b/chat-app-e2ad2.appspot.com/o/images%2Favatar_icon.png?alt=media&token=2ae0cf20-afff-4f7f-9c3c-2b6d97f35fc8';

  const dispatch = useDispatch();

  const validateEmail = email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const signUp = async () => {
    if (!validateEmail(email)) {
      SimpleToast.show(
        'Please provide a valid email address',
        SimpleToast.SHORT,
      );
      return;
    }

    if (password.length < 6) {
      SimpleToast.show(
        'Password should be at least 6 characters long',
        SimpleToast.SHORT,
      );
      return;
    }

    if (username.trim() === '') {
      SimpleToast.show('Username cannot be empty', SimpleToast.SHORT);
      return;
    }

    try {
      setLoading(true);
      // create user in auth
      const userCredentials = await auth().createUserWithEmailAndPassword(
        email.toLowerCase(),
        password,
      );
      const user = userCredentials.user;

      // create user in "users" collection
      await firestore()
        .collection('users')
        .doc(user.uid)
        .set({
          id: user.uid,
          email: user.email,
          username: username.toLowerCase(),
          name: '',
          avatar: defaultAvatar,
          bio: 'Hi there! I am using chat app',
          lastSeen: Date.now(),
        })
        .then(() => {
          console.log('User created!');
        });

      // create "chats" collection for specific user (chat list)
      await firestore()
        .collection('chats')
        .doc(user.uid)
        .set({
          chatsData: [],
        })
        .then(() => {
          console.log("User's chats created!");
        });

      // Saving data in RTK store after sign up
      const userSnapshot = await firestore()
        .collection('users')
        .doc(user.uid)
        .get();
      const userData = userSnapshot.data();
      if (userData) {
        dispatch(
          setUser({
            email: user.email,
            id: user.uid,
            username: userData.username,
            name: userData.name,
            avatar: userData.avatar,
            bio: userData.bio,
            lastSeen: userData.lastSeen,
          }),
        );
      }
      SimpleToast.show('Account created successfully!', SimpleToast.SHORT);
    } catch (err) {
      setLoading(false);
      SimpleToast.show(
        'Error creating account: ' + err.message,
        SimpleToast.LONG,
      );
      console.log(err);
    }
  };

  const signIn = async () => {
    if (!validateEmail(email)) {
      SimpleToast.show(
        'Please provide a valid email address',
        SimpleToast.SHORT,
      );
      return;
    }

    if (password.length < 6) {
      SimpleToast.show(
        'Password should be at least 6 characters long',
        SimpleToast.SHORT,
      );
      return;
    }

    try {
      setLoading(true);
      const userCredentials = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      const user = userCredentials.user;
      const userSnapshot = await firestore()
        .collection('users')
        .doc(user.uid)
        .get();
      const userData = userSnapshot.data();

      // console.log("This is data:", userData)
      SimpleToast.show('Logged in successfully!', SimpleToast.SHORT);
    } catch (err) {
      setLoading(false);
      SimpleToast.show(
        err.code.split('/')[1].split('-').join(' '),
        SimpleToast.SHORT,
      );
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      {currState === 'Sign up' ? (
        <View style={styles.innerContainer}>
          <Text style={styles.header}>{currState}</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            placeholder="Username.."
            placeholderTextColor="gray"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email.."
            placeholderTextColor="gray"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Password.."
            placeholderTextColor="gray"
            editable={!loading}
          />
          <Button
            title={currState === 'Sign up' ? 'Create account' : 'Login now'}
            onPress={signUp}
            disabled={loading}
          />
          <Text style={styles.switch}>
            Already have an account?{' '}
            <Text onPress={() => setCurrState('Login')} style={styles.span}>
              Click here
            </Text>
          </Text>
        </View>
      ) : (
        <View style={styles.innerContainer}>
          <Text style={styles.header}>{currState}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email.."
            placeholderTextColor="gray"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Password.."
            placeholderTextColor="gray"
            editable={!loading}
          />
          <Button
            title={currState === 'Sign up' ? 'Create account' : 'Login now'}
            onPress={signIn}
            disabled={loading}
          />
          <Text style={styles.switch}>
            Already have an account?{' '}
            <Text onPress={() => setCurrState('Sign up')} style={styles.span}>
              Click here
            </Text>
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0FE',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  header: {
    color: 'black',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 30,
    marginBottom: 20,
  },
  input: {
    width: '80%',
    padding: 5,
    margin: 5,
    borderWidth: 1,
    borderRadius: 10,
    color: 'black',
  },
  switch: {
    color: 'gray',
  },
  span: {
    fontWeight: 'bold',
    color: '#079cff',
  },
});

export default Login;
