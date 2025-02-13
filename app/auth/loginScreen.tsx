import React from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";
import { AntDesign, FontAwesome } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const LoginScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Image 
          source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTposSuF2d6XXv6JZVcCqtSoovsSBTXNLFuMQ&s" }} 
          style={styles.logo} 
        />
        <Text style={styles.title}>It Starts with a Swipe™</Text>

        <TouchableOpacity style={styles.button}>
          <AntDesign name="google" size={24} color="white" />
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <FontAwesome name="facebook" size={24} color="white" />
          <Text style={styles.buttonText}>Sign in with Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <AntDesign name="phone" size={24} color="white" />
          <Text style={styles.buttonText}>Sign in with Phone</Text>
        </TouchableOpacity>

        {/* Register Button */}
        <TouchableOpacity 
          style={styles.registerButton} 
          onPress={() => navigation.navigate("registerScreen")}
        >
          <Text style={styles.registerText}>New User? Register</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fd5068", // Tinder-like solid background color
  },
  content: {
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "white",
    marginBottom: 30,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.4)", // Slightly transparent white
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 30,
    marginBottom: 15,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  registerButton: {
    marginTop: 20,
  },
  registerText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});

export default LoginScreen;
