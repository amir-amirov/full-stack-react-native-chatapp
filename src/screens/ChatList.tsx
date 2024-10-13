import React, { useEffect, useState } from 'react';
import { View, Image, Text, FlatList, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useDispatch, useSelector } from 'react-redux';
import { setMessageId } from '../features/slices/messageSlice';
import { setChatUser } from '../features/slices/chatUserSlice';
import { setChatData } from '../features/slices/chatDataSlice';

const ChatList = ({navigation}) => {
  const [chats, setChats] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSeachBar, setShowSearchBar] = useState(false)

  const dispatch = useDispatch()
  const user = useSelector(state => state.user)
  const chatData = useSelector(state => state.chatData); 
  // your chat list (chatsData) where each object has not just rId but also userData of rId

  // Search users by username in Firestore
  const handleSearch = async (text) => {

    setSearchText(text);
    if (searchText.trim() === '') {
      setSearchResults([]);
      return;
    }

    try {
      const userQuery = await firestore().collection('users')
        .where('username', '>=', text.toLowerCase())
        .where('username', '<=', text.toLowerCase() + '\uf8ff')  // For case-insensitive prefix match
        .get();

      const users = userQuery.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setSearchResults(users);
    } catch (error) {
      console.log('Error searching users:', error);
    }
  };

  // Add user to your chatlist and you to his/her one
  const addChat = async (selectedUser) => {
    if (!user.id) return;

    const messagesCollectionRef = firestore().collection('messages')

    try {
      const newMessageDocRef = await messagesCollectionRef.add({
        messages: []
      })

      const userChatDoc = firestore().collection('chats').doc(user.id);
      const chatSnapshot = await userChatDoc.get();

      const existingChat = chatSnapshot.exists && chatSnapshot.data().chatsData.find(chat => chat.rId === selectedUser.id);
      if (existingChat) {
        console.log('Chat with this user already exists!');
        setSearchText("")
        return;
      }

      // If no existing chat, add a new one
      await userChatDoc.update({
        chatsData: firestore.FieldValue.arrayUnion({
          messageId: newMessageDocRef.id,
          rId: selectedUser.id,
          lastMessage: '',
          updatedAt: Date.now(),
          messageSeen: true,
        })
      });

      await firestore().collection('chats').doc(selectedUser.id).update({
        chatsData: firestore.FieldValue.arrayUnion({
          messageId: newMessageDocRef.id,
          rId: user.id,
          lastMessage: '',
          updatedAt: Date.now(),
          messageSeen: true,
        })
      })

      setSearchText("")
      setSearchResults([]);

    } catch (error) {
      console.log('Error starting chat:', error);
    }
  };

  const startChat = async (item) => {

    try {
      dispatch(setMessageId(item.messageId))
      dispatch(setChatUser(item))
      
      // Reference to the current user's chats document in Firestore
      const userChatsRef = firestore().collection('chats').doc(user.id)

      // Retrieve the document snapshot for the user's chats
      const userChatsSnapshot = await userChatsRef.get()

      // Access the data from the snapshot
      const userChatsData = userChatsSnapshot.data()

      // Find the index of the chat with the specific messageId
      const chatIndex = userChatsData.chatsData.findIndex(
        (c) => c.messageId === item.messageId
      )

      // Set the messageSeen field to true for that specific chat
      if (chatIndex !== -1) {
        userChatsData.chatsData[chatIndex].messageSeen = true;
      }

      // Update the chatsData array in Firestore with the modified chat
      await userChatsRef.update({
        chatsData: userChatsData.chatsData,
      });
      console.log("Updated chats successfully")
      navigation.navigate("ChatBox")
    } catch (err) {
      console.log("Error updating chats in startChat function")
      console.error(err)
    }
  }

  const renderChatItem = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => startChat(item)}>
      <Image style={item.messageSeen ? styles.avatar : styles.avatarCircled} source={ {uri: item.userData.avatar} }/>
      <View style={styles.nameAndLastMessages}>
        <Text style={styles.chatUsername}>{item.userData.name}</Text>
        <Text style={item.messageSeen ? styles.lastMessage : styles.lastMessageUnseen}>{item.lastMessage}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity style={styles.chatItem} onPress={() => addChat(item)}>
      <Image style={styles.avatar} source={ {uri: item.avatar} }/>
      <Text style={styles.chatUsername}>{item.name}</Text>
    </TouchableOpacity>
  );

  useEffect(() => {
    if (!user.id) return;

    // Fetch the chat list for the current user
    const userChatDoc = firestore().collection('chats').doc(user.id);

    const unsubscribe = userChatDoc.onSnapshot(async (docSnapshot) => {
      if (docSnapshot.exists) {
        const chatsItems = docSnapshot.data().chatsData || [];

        const tempData = []
        for (const item of chatsItems) {
          const userSnap = await firestore().collection('users').doc(item.rId).get()
          const userData = userSnap.data()
          tempData.push({ ...item, userData })
        }
        dispatch(setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt)));
        console.log(chatData)
      }
    });

    return () => unsubscribe(); 
  }, [user.id]);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      { 
      showSeachBar ?
      <View style={styles.searchContainer}>
        <TouchableOpacity style={styles.arrow} onPress={() => {setSearchText(""); setShowSearchBar(false);} }>
          <Image source={require("../assets/arrow_icon.png")} style={styles.searchIcon} resizeMode='cover'/>
        </TouchableOpacity>
        <TextInput
          style={styles.searchBar}
          placeholder="Search by username"
          placeholderTextColor="gray"
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>
      : 
      <View style={styles.search}>
        <Text style={styles.header}>JaiyqChat</Text>
        <TouchableOpacity onPress={() => setShowSearchBar(true)}>
          <Image source={require("../assets/search_icon.png")} style={styles.searchIcon}/>
        </TouchableOpacity>
      </View>
      }

      {searchText ? (
        // Show search results when search text is not empty
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          renderItem={renderSearchResult}
        />
      ) : (
        // Show chat list when search text is empty
        <FlatList
          data={chatData}
          keyExtractor={(item) => item.rId}
          renderItem={renderChatItem}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#001030"
  },
  search: {
    flexDirection: 'row',
    justifyContent: "space-between",
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  header: {
    color: "white",
    fontSize: 25,
    fontWeight: "bold",
  },
  searchIcon: {
    width: 25,
    height: 25,
    borderRadius: 20,
    marginRight: 10,
  },
  searchContainer:{
    flexDirection: "row",
    gap: 5,
  },
  chatItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarCircled: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 2,
    borderColor: "#07fff3",
  },
  nameAndLastMessages: {
    justifyContent: "center",
  },
  chatUsername: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "white",
  },
  lastMessage: {
    fontSize: 14,
    color: '#D3D3D3',
  },
  lastMessageUnseen: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#07fff3"
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingLeft: 10,
    marginBottom: 20,
    borderRadius: 8,
    backgroundColor: "white",
    color: "black",
  },
  arrow:{
    marginTop: 7,
  },
  searchItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
});

export default ChatList;

