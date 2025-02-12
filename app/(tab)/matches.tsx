import { 
  View, 
  SafeAreaView, 
  StyleSheet, 
  FlatList, 
  Image, 
  Text, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import React from 'react';
import MatchesHeader from '../../components/headers/MatchesHeader';

const { width } = Dimensions.get('window');
const IMAGE_SIZE = width * 0.33; // Adjusted for better spacing
const CARD_WIDTH = width * 0.45; // Responsive card width

const matches = [
  { id: '1', name: 'Sophia', image: 'https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?q=80&w=500&h=500&fit=crop', status: 'online' },
  { id: '2', name: 'Liam', image: 'https://plus.unsplash.com/premium_photo-1670282393309-70fd7f8eb1ef?q=80&w=500&h=500&fit=crop', status: 'offline' },
  { id: '3', name: 'Emily', image: 'https://plus.unsplash.com/premium_photo-1674864530332-4d7a3d05d0eb?q=80&w=500&h=500&fit=crop', status: 'online' },
  { id: '4', name: 'Daniel', image: 'https://plus.unsplash.com/premium_photo-1672865678972-d35aef807f71?q=80&w=500&h=500&fit=crop', status: 'offline' },
  { id: '5', name: 'Ava', image: 'https://plus.unsplash.com/premium_photo-1672877991658-8c59a3bdef0f?q=80&w=500&h=500&fit=crop', status: 'online' },
  { id: '6', name: 'Ethan', image: 'https://plus.unsplash.com/premium_photo-1672987456781-2a12d3d4e4d3?q=80&w=500&h=500&fit=crop', status: 'offline' },
  { id: '7', name: 'Daniel', image: 'https://plus.unsplash.com/premium_photo-1672865678972-d35aef807f71?q=80&w=500&h=500&fit=crop', status: 'offline' },
  { id: '8', name: 'Ava', image: 'https://plus.unsplash.com/premium_photo-1672877991658-8c59a3bdef0f?q=80&w=500&h=500&fit=crop', status: 'online' },
  { id: '9', name: 'Ethan', image: 'https://plus.unsplash.com/premium_photo-1672987456781-2a12d3d4e4d3?q=80&w=500&h=500&fit=crop', status: 'offline' },
  { id: '10', name: 'Ethan', image: 'https://plus.unsplash.com/premium_photo-1672987456781-2a12d3d4e4d3?q=80&w=500&h=500&fit=crop', status: 'offline' },
];

const MatchesScreen = () => {
  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <Image source={{ uri: item.image }} style={[styles.image, { width: IMAGE_SIZE, height: IMAGE_SIZE }]} />
      <Text style={styles.name}>{item.name}</Text>
      <View style={styles.statusContainer}>
        <View style={[styles.statusDot, { backgroundColor: item.status === 'online' ? '#27AE60' : '#E74C3C' }]} />
        <Text style={[styles.statusText, { color: item.status === 'online' ? '#27AE60' : '#E74C3C' }]}>{item.status}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <MatchesHeader />
      <View style={styles.content}>
        <FlatList
          data={matches}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA', // Light background for modern look
  },
  content: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    padding: 12,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    marginBottom: 15,
  },
  image: {
    borderRadius: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: 10,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 5,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default MatchesScreen;
