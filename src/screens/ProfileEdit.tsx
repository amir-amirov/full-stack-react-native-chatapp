// if a user is logged in, this screen will show up
import { View, Text, Button, Image, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import auth from "@react-native-firebase/auth";
import ImagePicker from 'react-native-image-crop-picker';
import { useEffect, useState } from 'react';
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import Ionicon from 'react-native-vector-icons/Ionicons'; 

const ProfileEdit = ({ navigation }) => {

  const user = useSelector(state => state.user);

  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showSaveButton, setShowSaveButton] = useState(false);

  // image crop picker
  const openGallery = async () => {
    try {
      setShowSaveButton(true)
      await ImagePicker.openPicker({
        width: 300,
        height: 300,
        cropping: true
      }).then(image => {
        setAvatar(image.path);
      });
    } catch (err) {
      console.log(err);
      setShowSaveButton(false)
    }
  };

  // Input: image url from firebase storage 
  const updateUserAvatar = async (url) => {
    try {
      await firestore().collection('users').doc(user.id).update({
        avatar: url,
      });
      console.log('User avatar updated!');
    } catch (error) {
      console.error('Error updating avatar: ', error);
    }
  };

  // Uploads image to firebase storage
  const uploadImageToFirebase = async () => {
    if (!avatar) return;
    const filename = avatar.substring(avatar.lastIndexOf('/') + 1);
    const uploadUri = avatar;

    const task = storage().ref(`images/${filename}`).putFile(uploadUri);

    try {
      await task;
      const url = await storage().ref(`images/${filename}`).getDownloadURL();
      updateUserAvatar(url);
    } catch (err) {
      console.error('Upload failed: ', err);
    }
  };

  const handleSave = async () => {
    if (name.trim() === '') {
      alert("Name cannot be empty");
      return;
    }

    try {
      if (avatar) {
        await uploadImageToFirebase();
      }

      await firestore()
        .collection('users')
        .doc(user.id)
        .update({
          name,
          bio,
        });
      console.log('User name and bio updated!');
      setIsEditing(false);
      setShowSaveButton(false);

    } catch (error) {
      console.error('Error updating user information: ', error);
    }
  };

  const logOut = async () => {
    try {
      await auth().signOut();
      console.log("User logged out!");
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (user?.id) {
      const fetchUserData = async () => {
        try {
          const userDoc = await firestore().collection('users').doc(user.id).get();

          if (userDoc.exists) {
            const userData = userDoc.data();
            setName(userData.name);
            setBio(userData.bio);
            setAvatar(userData.avatar);
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
        }
      };

      fetchUserData();
    }
  }, [user.id]);

  return (
    
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        {isEditing ? (
          <TouchableOpacity onPress={() => { setIsEditing(false); setShowSaveButton(false); }}>
            <Ionicon name="close" size={24} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => { setIsEditing(true); setShowSaveButton(true); }}>
            <Ionicon name="pencil" size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <TouchableOpacity onPress={openGallery} style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <Image source={require("../assets/avatar_icon.png")} style={styles.avatar} />
          )}
          <View style={styles.cameraIcon}>
            <Ionicon name="camera-outline" size={24} color="#4DB6F5" />
          </View>
        </TouchableOpacity>

        <View style={styles.infoSection}>
          <Text style={styles.infoAccount}>Account</Text>

          {/* Username */}
          <Text style={styles.infoValue}>{user.username}</Text>
          <Text style={styles.infoLabel}>Username</Text>

          {/* Name Input */}
          {isEditing ? (
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder='Enter your name...'
              style={styles.input}
              placeholderTextColor="#A0A0A0"
            />
          ) : (
            <TouchableOpacity onPress={() => { setIsEditing(true); setShowSaveButton(true); }}>
              <Text style={styles.infoValue}>{name}</Text>
              <Text style={styles.infoLabel}>Name</Text>
            </TouchableOpacity>
          )}

          {/* Bio Input */}
          {isEditing ? (
            <TextInput
              value={bio}
              onChangeText={setBio}
              placeholder='Tell about yourself...'
              multiline
              numberOfLines={4}
              style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
              placeholderTextColor="#A0A0A0"
            />
          ) : (
            <TouchableOpacity onPress={() => { setIsEditing(true); setShowSaveButton(true); }}>
              <Text style={styles.infoValue}>{bio || 'Add a bio'}</Text>
              <Text style={styles.infoLabel}>Bio</Text>
            </TouchableOpacity>
          )}

          {/* Save Button */}
          {showSaveButton && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Log Out Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={logOut}>
          <Text style={styles.logoutButtonText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8F0FE", 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: "#0088CC", 
  },
  headerTitle: {
    fontSize: 25,
    color: "white",
    fontWeight: "bold",
  },
  profileSection: {
    padding: 20,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#F0F0F0",
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: "30%",
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 5,
  },
  infoSection: {
    padding: 10,
    backgroundColor: "white",
    borderRadius: 10,
  },
  infoAccount: {
    color: "#0088CC",
    fontWeight: "bold",
    marginBottom: 20,
  },
  infoLabel: {
    color: "#A0A0A0",
    marginBottom: 10,
  },
  infoValue: {
    color: "#0C2340",
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: '#0088CC',
    borderRadius: 10,
    padding: 5,
    color: "#0C2340",
    marginTop: 10,
  },
  saveButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#0088CC",
    borderRadius: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutButton: {
    marginTop: 30,
    padding: 10,
    backgroundColor: "#FF3B30",
    borderRadius: 5,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default ProfileEdit