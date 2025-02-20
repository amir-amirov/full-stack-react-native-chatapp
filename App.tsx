import {Button, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Login from './src/screens/Login';
import ChatList from './src/screens/ChatList';
import ChatBox from './src/screens/ChatBox';
import ProfileEdit from './src/screens/ProfileEdit';
import {useEffect, useState} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {Provider, useDispatch} from 'react-redux';
import {setUser, removeUser} from './src/features/slices/userSlice';
import store from './src/features/store';
import {removeChatData} from './src/features/slices/chatDataSlice';
import {removeChatUser} from './src/features/slices/chatUserSlice';

const ProfileStack = createNativeStackNavigator();

function Profile({navigation}) {
  return (
    // Change to profile edit
    <ProfileStack.Navigator initialRouteName="ProfileEdit">
      <ProfileStack.Screen
        name="Login"
        component={Login}
        options={{headerShown: false}}
      />
      <ProfileStack.Screen
        name="ProfileEdit"
        component={ProfileEdit}
        options={{headerShown: false}}
      />
    </ProfileStack.Navigator>
  );
}

const ChatStack = createNativeStackNavigator();

function Chat({navigation}) {
  return (
    <ChatStack.Navigator initialRouteName="ChatList">
      <ChatStack.Screen
        name="ChatList"
        component={ChatList}
        options={{headerShown: false}}
      />
      <ChatStack.Screen
        name="ChatBox"
        component={ChatBox}
        options={{headerShown: false}}
      />
    </ChatStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const Main = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // to show login screen when unauthenticated
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async user => {
      if (user) {
        try {
          // Fetching user data from "users" collection
          const userSnapshot = await firestore()
            .collection('users')
            .doc(user.uid)
            .get();
          const userData = userSnapshot.data();
          if (userData) {
            // Ensure userData is not undefined
            dispatch(
              setUser({
                email: user.email,
                id: user.uid,
                username: userData.username,
                name: userData.name,
                bio: userData.bio,
                avatar: userData.avatar,
                lastSeen: userData.lastSeen,
              }),
            );
            console.log('Data fetched');
          } else {
            console.error(
              'No user data found for this user! Ignore, If raised after signup',
            );
          }
          setIsAuthenticated(true);
        } catch (err) {
          console.log(err);
        }
      } else {
        setIsAuthenticated(false);
        dispatch(removeUser());
        dispatch(removeChatData());
        dispatch(removeChatUser());
      }
    });
    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={styles.loading}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1}}>
      <NavigationContainer>
        {isAuthenticated ? (
          <Tab.Navigator
            screenOptions={({route}) => ({
              headerShown: false,
              tabBarIcon: ({focused, color, size}) => {
                let iconName;
                if (route.name === 'Profile') {
                  iconName = focused ? 'person' : 'person-outline';
                } else if (route.name === 'Chat') {
                  iconName = focused ? 'chatbubble' : 'chatbubble-outline';
                }
                return <Ionicons name={iconName} size={size} color={color} />;
              },
              tabBarLabel: ({focused}) => (
                <Text
                  style={{
                    fontSize: focused ? 15 : 14,
                    fontWeight: 'bold',
                    color: 'gray',
                  }}>
                  {route.name}
                </Text>
              ),
            })}>
            <Tab.Screen name="Profile" component={Profile} />
            <Tab.Screen name="Chat" component={Chat} />
          </Tab.Navigator>
        ) : (
          // If not authenticated, show the login screen
          <ProfileStack.Navigator>
            <ProfileStack.Screen
              name="Login"
              component={Login}
              options={{headerShown: false}}
            />
          </ProfileStack.Navigator>
        )}
      </NavigationContainer>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <Main />
    </Provider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 25,
  },
});
