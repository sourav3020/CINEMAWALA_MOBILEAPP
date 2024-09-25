import React, { useRef, useState, useEffect } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { auth, firestore } from '../config';
import { Timestamp, addDoc, collection, updateDoc, query, where, getDocs } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import { FontAwesome } from '@expo/vector-icons';
import { gsap, Back } from 'gsap-rn';
import { Ionicons } from '@expo/vector-icons';


export default function SignUp({ navigation }) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [userNameErrorMessage, setUserNameErrorMessage] = useState(['', '']);
  const [emailErrorMessage, setEmailErrorMessage] = useState(['', '']);
  const [birthDate, setBirthDate] = useState(moment(new Date()).format('DD/MM/YYYY'));
  const [birthDateModalStatus, setBirthDateModalStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMultipleTextBox, setShowMultipleTextBox] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const viewRef = useRef(null);

  const userNameMessages = [
    ["This is a unique Username", 'green'],
    ["The Username has already been taken.", 'red'],
    ['', '']
  ];

  const uniqueAndValidEmailMessage = [
    ["This is a valid Email", 'green'],
    ["Please enter a valid and unique email", 'red'],
    ['Email already has been taken.', 'red'],
    ['', '']
  ];

  const setAllNone = () => {
    setErrorMessage('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setUserName('');
    setBirthDate('');
    setUserNameErrorMessage(['', '']);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  useEffect(() => {
    const checkUniqueEmail = async () => {
      if (email != '') {
        if (isValidEmail(email) == false) {
          setEmailErrorMessage(uniqueAndValidEmailMessage[1]);
          return;
        }
        try {
          const userRef = collection(firestore, "users");
          const q = query(userRef, where('email', '==', email));
          const querySnapshot = await getDocs(q);
          if (querySnapshot.size == 0) {
            setShowMultipleTextBox(true);
            setEmailErrorMessage(uniqueAndValidEmailMessage[0]);
          } else {
            setShowMultipleTextBox(false);
            setEmailErrorMessage(uniqueAndValidEmailMessage[2]);
          }
        } catch (e) {
          console.log(e);
          setEmailErrorMessage(uniqueAndValidEmailMessage[1]);
        }
      } else {
        setShowMultipleTextBox(false);
        setEmailErrorMessage(uniqueAndValidEmailMessage[1]);
      }
    };
    checkUniqueEmail();
  }, [email]);

  useEffect(() => {
    const checkUniqueUserName = async () => {
      if (userName != '') {
        try {
          const userRef = collection(firestore, "users");
          const q = query(userRef, where('userName', '==', userName));
          const querySnapshot = await getDocs(q);
          if (querySnapshot.size == 0) setUserNameErrorMessage(userNameMessages[0]);
          else setUserNameErrorMessage(userNameMessages[1]);
        } catch (e) {
          console.log(e);
        }
      } else setUserNameErrorMessage(userNameMessages[2]);
    };
    checkUniqueUserName();
  }, [userName]);

  const doFireBaseUpdate = async () => {
    const usersRef = collection(firestore, 'users');
    try {
      const docRef = await addDoc(usersRef, {
        "userName": userName,
        "email": email,
        "dp_url": "images/avatar.jpg",
        "joiningDate": Timestamp.fromDate(new Date()),
        'birthday': birthDate,
        "user_id": '' // This will be updated later
      });
  
      // Chain the update operation after the document is added
      updateDoc(docRef, { "user_id": docRef.id }); 
    } catch (e) {
      console.log(e);
    }
  };
  

  const registerWithEmail = async () => {
    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      try {
        await sendEmailVerification(user);
        console.log('Email verification link sent successfully');
      } catch (e) {
        alert("Something went wrong");
        console.log(e);
      }
      setAllNone();
      doFireBaseUpdate();
      setLoading(false);
      alert("Account Created! Please check your email and verify yourself.");
    } catch (e) {
      if (e.code === 'auth/email-already-in-use') setErrorMessage("Email has already been used");
      else if (e.code === 'auth/weak-password') setErrorMessage("Please provide a strong password");
      else if (e.code === 'auth/invalid-email') setErrorMessage("Please provide a valid email");
      alert(e.code);
      setLoading(false);
    }
  };

  const onSingUpPress = async () => {
    if (email.length == 0 || password.length == 0 || userName.length == 0) {
      setErrorMessage("Please provide all the necessary information");
    } else if (email.length > 0 && password.length > 0 && confirmPassword.length > 0 && userName.length > 0) {
      if (password === confirmPassword && userNameErrorMessage[1] == 'green') registerWithEmail();
      else if (password !== confirmPassword) setErrorMessage("Passwords do not match");
      else setErrorMessage("Please provide a valid username");
    } else {
      setErrorMessage("Something is missing!");
    }
  };

  useEffect(() => {
    const view = viewRef.current;
    gsap.to(view, { duration: 1, transform: { rotate: 360, scale: 1 }, ease: Back.easeInOut });
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={{ backgroundColor: '#fff', height: '100%' }} showsVerticalScrollIndicator={false}>
        <Image
          ref={viewRef}
          style={styles.logo}
          source={require('../assets/L2.png')}
        />
        <TextInput
          style={styles.input}
          placeholderTextColor="#aaaaaa"
          placeholder='User Name'
          onChangeText={(text) => {
            setUserName(text.trim());
          }}
          value={userName}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        {userNameErrorMessage[0].length > 0 && userName.length > 0 && <Text style={{ color: userNameErrorMessage[1], paddingLeft: 20, fontSize: 13 }}>*{userNameErrorMessage[0]}*</Text>}
        <TextInput
          style={styles.input}
          placeholder='Email'
          placeholderTextColor="#aaaaaa"
          onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
          value={email}
          underlineColorAndroid="transparent"
          autoCapitalize="none"
        />
        {emailErrorMessage[0].length > 0 && email.length > 0 && <Text style={{ color: emailErrorMessage[1], paddingLeft: 20, fontSize: 13 }}>*{emailErrorMessage[0]}*</Text>}
        {showMultipleTextBox &&
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, styles.input]}
              placeholderTextColor="#aaaaaa"
              secureTextEntry={!showPassword}
              placeholder='Password'
              onChangeText={(text) => { setPassword(text); setErrorMessage('') }}
              value={password}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="#aaaaaa" />
            </TouchableOpacity>
          </View>
        }
        {showMultipleTextBox &&
          <View style={styles.passwordContainer}>
            <TextInput
              style={[styles.passwordInput, styles.input]}
              placeholderTextColor="#aaaaaa"
              secureTextEntry={!showConfirmPassword}
              placeholder='Confirm Password'
              onChangeText={(text) => { setConfirmPassword(text); setErrorMessage('') }}
              value={confirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
              <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={24} color="#aaaaaa" />
            </TouchableOpacity>
          </View>
        }

        {showMultipleTextBox &&
          <TouchableOpacity
            style={styles.birthdayPicker}
            onPress={() => setBirthDateModalStatus(true)}>
            <Text style={{ marginTop: 10, fontWeight: '300', color: '#353635', fontSize: 16 }}>
              <FontAwesome name="birthday-cake" size={22} color="#e80505" /> &nbsp; &nbsp;
              {birthDate}
            </Text>
          </TouchableOpacity>}
        {birthDateModalStatus && <DateTimePicker
          testID="dateTimePicker"
          value={moment(birthDate, 'DD/MM/YYYY').toDate()}
          mode="date"

          onChange={(e, date) => {
            const day = date.getDate();
            const month = date.getMonth();
            const year = date.getFullYear();

            const formattedDate = `${day.toString().padStart(2, '0')}/${(month + 1).toString().padStart(2, '0')}/${year.toString()}`;

            setBirthDate(formattedDate)
            setBirthDateModalStatus(false);
          }}
        />}
        {errorMessage.length > 0 && <Text style={{ color: 'red', textAlign: 'center' }}>*{errorMessage}*</Text>}
        <TouchableOpacity
          disabled={password.length == 0 || email.length == 0}
          style={styles.button}
          onPress={() => onSingUpPress()}>
          <Text style={styles.buttonTitle}>
            {loading ? <ActivityIndicator size={20} color={"#fff"} /> : "Sign up"}
          </Text>
        </TouchableOpacity>
        <View style={styles.footerView}>
          <Text style={styles.footerText}>Already have an account? <Text onPress={() => {
            setAllNone();
            navigation.navigate('LogIn');
          }} style={styles.footerLink}>Log In</Text></Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff'
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    fontStyle: 'italic',
    marginBottom: 20
  },
  logo: {
    alignSelf: 'center',
    height: 150,
    width: 200,
    marginBottom: 20,
    marginTop: 30
  },
  input: {
    height: 48,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    color: '#5591ad',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 15,
    marginRight: 15,
    paddingLeft: 16
  },
  birthdayPicker: {
    height: 48,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    color: 'blue',
    marginTop: 10,
    marginBottom: 10,
    marginLeft: 15,
    marginRight: 15,
    paddingLeft: 16
  },
  button: {
    backgroundColor: '#0066cc',
    marginLeft: 30,
    marginRight: 30,
    marginTop: 20,
    height: 48,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: 'center'
  },
  buttonTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: "bold"
  },
  footerView: {
    flex: 1,
    alignItems: "center",
    marginTop: 20,
    paddingBottom: 50,
  },
  footerText: {
    fontSize: 16,
    color: '#2e2e2d'
  },
  footerLink: {
    color: "#e80505",
    fontWeight: "bold",
    fontSize: 16
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',     
    borderColor: 'gray',
    width: '100%',
    position: 'relative'
  },
  passwordInput: {
    flex: 1,  
    height: 40,
    paddingHorizontal: 10,
  },
  eyeIcon: {
    padding: 10,
    position: 'absolute',
    right: 20
  },
});
