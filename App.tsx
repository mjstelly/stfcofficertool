import React, {useEffect, useState} from 'react';
import {View, Text, FlatList} from 'react-native';
import firestore from '@react-native-firebase/firestore';

const fetchData = async (
  setData: React.Dispatch<React.SetStateAction<any[]>>,
) => {
  try {
    const snapshot = await firestore().collection('officers').get();
    const fetchedData = snapshot.docs.map(doc => doc.data());
    setData(fetchedData);
  } catch (error) {
    console.error('Firestore fetch error:', error);
  }
};

const App = () => {
  const [data, setData] = useState<Array<any>>([]);

  useEffect(() => {
    fetchData(setData);
  }, []);

  return (
    <View>
      <Text>Firestore Data:</Text>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => <Text>{JSON.stringify(item)}</Text>}
      />
    </View>
  );
};

export default App;
