import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import firestore from '@react-native-firebase/firestore';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons'; 
import ImagePicker from 'react-native-image-crop-picker';
import storage from '@react-native-firebase/storage';

const ChatBox = ({navigation}) => {
  const user = useSelector((state) => state.user);
  const chatUser = useSelector((state) => state.chatUser);

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [imageUri, setImageUri] = useState(null); // for image message

  const sendMessage = async () => {
    try {
      if (input && chatUser.messageId) {
        await firestore()
          .collection('messages')
          .doc(chatUser.messageId)
          .update({
            messages: firestore.FieldValue.arrayUnion({
              sId: user.id,
              text: input,
              createdAt: new Date(),
              isLiked: false, 
            }),
          });

        const userIDs = [chatUser.rId, user.id];

        userIDs.forEach(async (id) => {
          const userChatsRef = firestore().collection('chats').doc(id);
          const userChatsSnapshot = await userChatsRef.get();

          if (userChatsSnapshot.exists) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(
              (c) => c.messageId === chatUser.messageId
            );
            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30);
            userChatData.chatsData[chatIndex].updatedAt = firestore.Timestamp.now();
            if (userChatData.chatsData[chatIndex].rId === user.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }
            await userChatsRef.update({
              chatsData: userChatData.chatsData,
            });
          }
        });
      }
      setInput('');
    } catch (err) {
      console.error(err);
    }
  };

  const convertTimestamp = (timestamp) => {
    let date;
    if (timestamp && typeof timestamp.toDate === 'function') {
      date = timestamp.toDate();
    } else if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
      date = new Date(timestamp.seconds * 1000);
    } else {
      date = new Date(timestamp);
    }

    const hour = date.getHours() + 5;
    const minute = date.getMinutes();
    const formattedTime = `${hour % 12 || 12}:${minute < 10 ? '0' + minute : minute} ${hour >= 12 ? 'PM' : 'AM'}`;

    return formattedTime;
  };

  const uploadImageToFirebase = async (uri) => {
    console.log("This is uploadImageToFirebase", uri)
    if (!uri) return;

    const filename = uri.substring(uri.lastIndexOf('/') + 1);
    const uploadUri = uri;

    const task = storage().ref(`images/${filename}`).putFile(uploadUri);

    try {
      await task;
      const url = await storage().ref(`images/${filename}`).getDownloadURL();
      return url;
    } catch (err) {
      console.error('Upload failed: ', err);
    }
  };

  const upload = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true
      })

      return image.path

    } catch (err) {
      console.log(err);
    }

  }

  const sendImage = async () => {
    try {
      const imageCropped = await upload();
      const fileUrl = await uploadImageToFirebase(imageCropped);
      if (fileUrl && chatUser.messageId) {
        
        // Update the main chat with the image
        await firestore().collection("messages").doc(chatUser.messageId).update({
          messages: firestore.FieldValue.arrayUnion({
            sId: user.id,
            image: fileUrl,
            createdAt: new Date(),
            isLiked: false, 
          })
        });
        console.log("Messages collection is changed")

        const userIDs = [chatUser.rId, user.id];

        // Loop through user IDs to update their chat documents
        userIDs.forEach(async (id) => {
          const userChatsRef = firestore().collection('chats').doc(id);
          const userChatsSnapshot = await userChatsRef.get();

          if (userChatsSnapshot.exists) {
            const userChatData = userChatsSnapshot.data();
            const chatIndex = userChatData.chatsData.findIndex(c => c.messageId === chatUser.messageId);

            userChatData.chatsData[chatIndex].lastMessage = "Image";
            userChatData.chatsData[chatIndex].updatedAt = Date.now();

            if (userChatData.chatsData[chatIndex].rId === user.id) {
              userChatData.chatsData[chatIndex].messageSeen = false;
            }

            await userChatsRef.update({
              chatsData: userChatData.chatsData
            });
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Function to handle liking/unliking a message
  const toggleLike = async (message) => {
    if(message.sId === user.id){
      return
    }
    const updatedMessages = messages.map(msg => {
      if (msg.createdAt === message.createdAt) {
        return { ...msg, isLiked: !msg.isLiked };
      }
      return msg;
    });

    setMessages(updatedMessages);

    await firestore()
      .collection('messages')
      .doc(chatUser.messageId)
      .update({
        messages: updatedMessages,
      });
  };

  useEffect(() => {
    const chatId = chatUser.messageId;
    const unsubscribe = firestore()
      .collection('messages')
      .doc(chatId)
      .onSnapshot((doc) => {
        const data = doc.data();
        console.log('Fetched messages from Firestore:', data.messages);
        setMessages(data.messages); 
      });

    return () => unsubscribe();
  }, [chatUser.messageId]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image style={styles.backIcon} source={require("../assets/arrow_icon.png")}/>
        </TouchableOpacity>
        <Image source={{ uri: chatUser.userData.avatar }} style={styles.avatar} />
        <Text style={styles.username}>{chatUser.userData.name}</Text>
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={[styles.message, item.sId === user.id ? styles.myMessage : styles.theirMessage]}>
            {item.image ? (
              <Image source={{ uri: item.image }} style={item.sId === user.id ? styles.myMessageImage : styles.messageImage} resizeMode='cover'/>
            ) : (
              <Text style={item.sId === user.id ? styles.myMessageText : styles.messageText}>
                {item.text}
              </Text>
            )}
            <Text style={item.sId === user.id ? styles.myTimestamp : styles.timestamp}>{convertTimestamp(item.createdAt)}</Text>
            <TouchableOpacity onPress={() => toggleLike(item)} style={((item.sId === user.id) && !item.isLiked) ? {display: "none"} : styles.likeButton}>
              <Ionicon name={item.isLiked ? "heart" : "heart-outline"} size={20} color={item.isLiked ? "red" : "gray"} />
              {item.isLiked && <Text style={item.sId === user.id ? styles.myLikeCount : styles.likeCount}>Liked</Text>}
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder='Type here...'
        />
        <TouchableOpacity onPress={sendImage}>
          <Ionicon name="attach" size={30} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity onPress={sendMessage}>
          <Image source={require("../assets/send_button.png")} style={{ width: 40, height: 40, marginLeft: 5 }} resizeMode="contain"/>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  backIcon: {
    width: 20,
    height: 20,
    marginRight: 15,
    marginLeft: 5,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 10,
  },
  message: {
    margin: 10,
    padding: 10,
    borderRadius: 10,
    borderBottomLeftRadius: 0,
    maxWidth: '80%',
    position: 'relative',
  },
  myMessage: {
    backgroundColor: '#007aff',
    alignSelf: 'flex-end',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 0,
  },
  theirMessage: {
    backgroundColor: '#e5e5ea',
    alignSelf: 'flex-start',
  },
  myMessageText: {
    fontSize: 16,
    color: 'white',
  },
  messageText: {
    fontSize: 16,
    color: 'black',
  },
  myTimestamp: {
    alignSelf: 'flex-end',
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  messageImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
    alignSelf: 'flex-end',
  },
  myMessageImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 5,
    alignSelf: 'flex-end',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  likeCount: {
    marginLeft: 5,
    color: 'gray',
    fontSize: 12,
  },
  myLikeCount: {
    marginLeft: 5,
    color: 'white',
    fontSize: 12,
  }
});

export default ChatBox;
