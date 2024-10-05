import React, { useState, useEffect, useRef } from 'react'; // <-- Added useRef
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, firestore } from '../config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { Checkbox } from 'react-native-paper';
import { gsap, Back } from 'gsap-rn';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRememberMeChecked, setIsRememberMeChecked] = useState(false);
    const viewRef = useRef(null);  // <-- Added useRef here

    const signIn = async () => {
        try {
            setLoading(true);
            setEmail(email.trim());

            await signInWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                if (user.emailVerified) {
                    const usersRef = collection(firestore, "users");
                    const q = query(usersRef, where("email", "==", email));
                    const querySnapshot = await getDocs(q);
                    querySnapshot.forEach((doc) => {
                        const userData = doc.data();
                        const { userName, user_id, email, dp_url, birthday } = userData;
                        const loggedUserInfo = {
                            userRef: user_id,
                            userEmail: email,
                            userName: userName,
                            userProfilePic: dp_url,
                            birthday: birthday
                        };
                        if (isRememberMeChecked) {
                            const loggedUserInfoString = JSON.stringify(loggedUserInfo);
                            AsyncStorage.setItem('userData', loggedUserInfoString);
                        }
                        setEmail('');
                        setPassword('');
                        setLoading(false);
                        navigation.replace('AppNav');
                    });
                } else {
                    Alert.alert("Please verify your email first.");
                    setLoading(false);
                }
            })
            .catch((e) => {
                if (e.code === 'auth/invalid-email') setErrorMessage("Invalid Email.");
                else if (e.code === 'auth/invalid-credential' || e.code === 'auth/invalid-login-credentials') setErrorMessage("Invalid Credentials");
                else if (e.code === 'auth/too-many-requests') setErrorMessage("Please try again later.");
                else if (e.code === 'auth/user-not-found') setErrorMessage('No account matches this email');
                else console.log(e);
                setLoading(false);
            });
        } catch (error) {
            setLoading(false);
        }
    };

    useEffect(() => {
        const checkLoggedIn = async () => {
            const userData = await AsyncStorage.getItem('userData');
            if (userData) {
                navigation.replace('AppNav');
            }
        };
        checkLoggedIn();
    }, []);

    useEffect(() => {
        const view = viewRef.current;
        if (view) {  // <-- Added this conditional check for safety
            gsap.to(view, { duration: 1, rotate: 360, scale: 1, ease: Back.easeInOut });  // <-- Fixed the GSAP syntax
        }
    }, []);  // <-- Added useEffect to trigger GSAP on component mount

    return (
        <View style={styles.container}>
            <ScrollView style={{ backgroundColor: '#fff', height: '100%' }} showsVerticalScrollIndicator={false}>
                <Image
                    ref={viewRef}  // <-- Attached the ref to the Image
                    style={styles.logo}
                    source={require('../assets/L2.png')}
                />
                <Text style={styles.title}>Login</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Email'
                    placeholderTextColor="#aaaaaa"
                    onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
                    value={email}
                    autoCapitalize="none"
                />
                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
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
                <View style={styles.checkboxContainer}>
                    <Checkbox
                        status={isRememberMeChecked ? 'checked' : 'unchecked'}
                        onPress={() => { setIsRememberMeChecked(!isRememberMeChecked); }}
                        color={isRememberMeChecked ? '#0066cc' : undefined}
                    />
                    <Text style={styles.checkboxLabel}>Remember me</Text>
                </View>
                {errorMessage.length > 0 && <Text style={styles.errorMessage}>*{errorMessage}*</Text>}
                <TouchableOpacity
                    disabled={password.length === 0 || email.length === 0}
                    style={styles.button}
                    onPress={signIn}>
                    <Text style={styles.buttonTitle}>
                        {loading ? <ActivityIndicator size={18} color={"#fff"} /> : "Log in"}
                    </Text>
                </TouchableOpacity>
                <View style={styles.footerView}>
                    <Text style={styles.footerText}>Don't have an account? <Text onPress={() => {
                        setEmail('');
                        setPassword('');
                        setErrorMessage('');
                        navigation.navigate('SignUp');
                    }} style={styles.footerLink}>Sign up</Text></Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    
    logo: {  
        width: 200,
        height: 150,
        alignSelf: 'center',
        marginBottom: 20,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 28,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        height: 50,
        width: '100%',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        marginBottom: 20,
        paddingHorizontal: 10,
        backgroundColor: '#fff',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 8,
        marginBottom: 20,
        width: '100%',
        backgroundColor: '#fff',
    },
    passwordInput: {
        flex: 1,
        height: 50,
        paddingHorizontal: 10,
    },
    eyeIcon: {
        padding: 10,
    },
    errorMessage: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#0066cc',
        paddingVertical: 15,
        borderRadius: 8,
        width: '100%',
    },
    buttonTitle: {
        color: 'white',
        textAlign: 'center',
        fontSize: 16,
    },
    footerView: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 16,
        color: '#666',
    },
    footerLink: {
        color: '#0066cc',
        fontWeight: '600',
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    checkboxLabel: {
        marginLeft: 10,
        fontSize: 16,
        color: '#333',
    },
    
});
