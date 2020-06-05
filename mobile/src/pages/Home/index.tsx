import React, {useState, useEffect, ChangeEvent} from 'react';
import {Feather as Icon} from '@expo/vector-icons'
import { View, ImageBackground, StyleSheet, Image, Text } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native'
import axios from 'axios'
import RNPickerSelect from 'react-native-picker-select';

interface UF {
  label: string
  value: string
}
interface City {
  label: string
  value: string
}

interface IBGEUFResponse { 
  id: number
  sigla: string
  nome: string
}

interface IBGECITYResponse { 
  id: number
  nome: string
}

const Home: React.FC = () => {
  const navigation = useNavigation()
  const [ufs, setUfs] = useState<UF[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedUf, setSelectedUf] = useState<string>('0')
  const [selectedCity, setSelectedCity] = useState<string>('0')

  function handleNavigateToPoints() {
    navigation.navigate('Points', {uf: selectedUf, city: selectedCity})
  }

  function handleSelectUf(value: string) {
    setSelectedUf(value)
  }

  function handleSelectCity(value: string) {
    setSelectedCity(value)
  }

  useEffect(()=> {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/?orderBy=nome')
      .then(response => {
        const ufs = response.data.map(uf => {
          return {
            label: uf.sigla,
            value: uf.sigla,
          }
        })
        setUfs(ufs)
      })
  },[])

  useEffect(()=> {
    if(selectedUf === '0') {
      setCities([])
      return
    }
    axios.get<IBGECITYResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/distritos?orderBy=nome`)
      .then(response => {
        const cities = response.data.map(city => {
          return {
            label: city.nome,
            value: city.nome
          }
        })
        setCities(cities)
      })
  },[selectedUf])

  return (
    <ImageBackground 
      source={require('../../assets/home-background.png')} 
      style={styles.container}
      imageStyle={{width: 274, height: 368}}
    >
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')}/>
        <Text style={styles.title}>Seu marketplace de coleta de residuos</Text>
        <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente</Text>
      </View>
      <View style={styles.footer}>

        <RNPickerSelect
          onValueChange={handleSelectUf}
          items={ufs}
          style={pickerSelectStyles}
          placeholder={{
            label: 'Selecione um estado.',
            value: "0",
            color: '#9EA0A4',
          }}
        />

        <RNPickerSelect
          onValueChange={handleSelectCity}
          items={cities}
          style={pickerSelectStyles}
          placeholder={{
            label: 'Selecione uma Cidade.',
            value: "0",
            color: '#9EA0A4',
          }}
        />

        <RectButton style={styles.button} onPress={handleNavigateToPoints}>
          <View style={styles.buttonIcon}>
            <Icon name="arrow-right" color="#FFF" size={24}></Icon>
          </View>
            <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground>
  );
}

export default Home;

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'gray',
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
  inputAndroid: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
    paddingVertical: 8,
    borderWidth: 0.5,
    borderColor: 'purple',
    color: 'black',
    paddingRight: 30, // to ensure the text is never behind the icon
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
  },

  main: {
    flex: 1,
    justifyContent: 'center',
  },

  title: {
    color: '#322153',
    fontSize: 32,
    fontFamily: 'Ubuntu_700Bold',
    maxWidth: 260,
    marginTop: 64,
  },

  description: {
    color: '#6C6C80',
    fontSize: 16,
    marginTop: 16,
    fontFamily: 'Roboto_400Regular',
    maxWidth: 260,
    lineHeight: 24,
  },

  footer: {},

  select: {},

  input: {
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 10,
    marginBottom: 8,
    paddingHorizontal: 24,
    fontSize: 16,
  },

  button: {
    backgroundColor: '#34CB79',
    height: 60,
    flexDirection: 'row',
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    marginTop: 8,
  },

  buttonIcon: {
    height: 60,
    width: 60,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },

  buttonText: {
    flex: 1,
    justifyContent: 'center',
    textAlign: 'center',
    color: '#FFF',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
  }
});