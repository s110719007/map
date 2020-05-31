import React, {useState, useEffect } from 'react';
import {  Platform,StyleSheet, Text, View,Image } from 'react-native';
import MapView, { Marker } from "react-native-maps";
import mapStyle from "./styles/mapStyle.json"
import Constants from "expo-constants";
import * as Location from "expo-location";
import book from "./styles/img.json";
import { Icon } from "react-native-elements";
import { VictoryPie } from "victory-native";

import metroJson from "./json/metro.json"
import axios from "axios";

const UBIKE_URL =
  "https://data.ntpc.gov.tw/api/datasets/71CD1490-A2DF-4198-BEF1-318479775E8A/json/preview";



  const dataColor = ["#FFA600", "#00BBFF"];

const  App= () => {
 

  const [region,setRegion] = useState({
    longitude: 121.544637,
    latitude: 25.024624,
    longitudeDelta: 0.01,
    latitudeDelta: 0.02,
  });
  const [marker, setMarker] = useState({
    coord: {
      longitude: 121.544637,
      latitude: 25.024624,
    },
    name: "1",
    address: "2",
  });
  const [onCurrentLocation, setOnCurrentLocation] = useState(false);
  const [metro, setMetro] = useState(metroJson);
  const [ubike, setUbike] = useState([]);

  const onRegionChangeComplete = (rgn) => {
    if (
      Math.abs(rgn.latitude - region.latitude) > 0.002 ||
      Math.abs(rgn.longitude - region.longitude) > 0.002
    ) {
      setRegion(rgn);
      setOnCurrentLocation(false);
    }
  };
  const getUbikeAsync = async () => {
    let response = await axios.get(UBIKE_URL);
    setUbike(response.data);
  };

  const setRegionAndMarker = (location) => {
    setRegion({
      ...region,
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
    });
    setMarker({
      ...marker,
      coord: {
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
      },
    });
  };

  const getLocation = async () => {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setMsg("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setRegionAndMarker(location);
    setOnCurrentLocation(true);
  };

  useEffect(() => {
    if (Platform.OS === "android" && !Constants.isDevice) {
      setErrorMsg(
        "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      );
    } else {
      getLocation();
      getUbikeAsync();
    }
  }, []);
  return (
    <View style={{flex:1}}>
      <MapView
        region={region}
        style={{ flex: 1 }}
        showsTraffic
        provider="google"
        customMapStyle={mapStyle}
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {
            <Marker
            coordinate={marker.coord}
            title={marker.name}
            description={marker.address}
          >
           <Image style={styles.marker} source={{url:book[0].marker}}/>
          </Marker>
        }
    {metro.map((site) => (
      <Marker
          coordinate={{ latitude: site.latitude, longitude: site.longitude }}
          key={`${site.id}${site.line}`}
          title={site.name}
          description={site.address}
        >
           <Image style={styles.ma} source={{uri:book[0].mrt}} />
           </Marker>
    ))}
     {ubike.map((site) => (
          <Marker
            coordinate={{
              latitude: Number(site.lat),
              longitude: Number(site.lng),
            }}
            key={site.sno}
            title={`${site.sna} ${site.sbi}/${site.tot}`}
            description={site.ar}
          >
              <VictoryPie
           
            data={[
              {x:site.tot-site.sbi,y:100-(site.sbi/site.tot)*100},
              
              {x:site.sbi,y:(site.sbi/site.tot)*100},
               ]}
            radius={17}
            colorScale={dataColor}
            innerRadius={7}
            labelRadius={10}
            />
           </Marker>
        ))}
      </MapView>

      {!onCurrentLocation && (
        <Icon
          raised
          name="ios-locate"
          type="ionicon"
          color="black"
          containerStyle={{
            backgroundColor: "#517fa4",
            position: "absolute",
            right: 20,
            bottom: 40,
          }}
          onPress={getLocation}
        />
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  marker:{
    width: 50,
    height: 50,
    borderRadius: 90,
    backgroundColor: "rgba(130,4,150, 0.3)",
    borderWidth: 5,
    borderColor: "rgba(130,4,150, 0.5)",
  },
  ma: {
    width:30,
    height:30,
    backgroundColor:"#fff"
  },
});

 export default App;