import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import React, { useState } from "react";
import { Button, Dimensions, ImageBackground, StyleSheet, Text, TextInput, View } from "react-native";
const { width, height } = Dimensions.get("window");

type WeatherData = {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: { main: string; description: string }[];
  wind: { speed: number };
};

export default function App() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState<WeatherData | null>(null);

  const API_KEY = "bc61279bf5f9234380facea2f6d2946d"; // Your OpenWeather API key

  // Get weather by city
  const getWeather = async () => {
    if (!city.trim()) return;
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city.trim()}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      if (data.cod === 200) {
        setWeather(data);
      } else {
        setWeather(null);
        alert(`❌ ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      alert("❌ Unable to fetch weather.");
    }
  };

  // Get weather by current location
  const getCurrentLocationWeather = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    const { latitude, longitude } = location.coords;

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      const data = await response.json();
      setWeather(data);
    } catch (error) {
      console.error(error);
      alert("❌ Unable to fetch weather for current location.");
    }
  };

  // Map weather type to icon
  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain) {
      case "Clouds": return "weather-cloudy";
      case "Rain": return "weather-rainy";
      case "Clear": return "weather-sunny";
      case "Snow": return "weather-snowy";
      case "Thunderstorm": return "weather-lightning";
      default: return "weather-partly-cloudy";
    }
  };

  // Map weather type to background image
    const getBackground = (weatherMain: string) => {
    switch (weatherMain) {
      case "Clouds": return require("../assets/images/cloudy.jpg");
      case "Rain": return require("../assets/images/rain.jpg");
      case "Clear": return require("../assets/images/sunny.jpg");
      case "Snow": return require("../assets/images/snow.jpg");
      default: return require("../assets/images/default.jpg");
    }
    };


  return (
    <ImageBackground
      source={weather ? getBackground(weather.weather[0].main) : require("../assets/images/default.jpg")}
      style={{ width: width, height: height, flex: 1, alignItems: "center", justifyContent: "center" }}
      resizeMode="cover"
    >
      <Text style={styles.title}>🌦️ Weather App</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter city name"
        value={city}
        onChangeText={setCity}
      />

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <Button title="Get Weather" onPress={getWeather} />
        <Button title="Current Location" onPress={getCurrentLocationWeather} />
      </View>

      {weather && (
        <View style={styles.result}>
          <Text style={styles.city}>{weather.name}</Text>
          <MaterialCommunityIcons
            name={getWeatherIcon(weather.weather[0].main)}
            size={60}
            color="#fff"
          />
          <Text style={styles.temp}>{weather.main.temp} °C</Text>
          <Text style={styles.description}>{weather.weather[0].description}</Text>
          <Text>Humidity: {weather.main.humidity}%</Text>
          <Text>Wind: {weather.wind.speed} m/s</Text>
        </View>
      )}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff",
  },
  input: {
    width: "80%",
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  result: {
    marginTop: 20,
    alignItems: "center",
  },
  city: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  temp: {
    fontSize: 40,
    fontWeight: "bold",
    marginVertical: 10,
    color: "#fff",
  },
  description: {
    fontSize: 18,
    fontStyle: "italic",
    color: "#fff",
    marginBottom: 5,
  },
});
