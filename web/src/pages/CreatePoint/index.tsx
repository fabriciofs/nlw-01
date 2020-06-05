import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import {Link, useHistory} from 'react-router-dom'
import {FiArrowLeft} from 'react-icons/fi'
import {Map, TileLayer, Marker} from 'react-leaflet'
import axios from 'axios'
import {LeafletMouseEvent} from 'leaflet'
import api from '../../services/api'

import './styles.css'

import logo from '../../assets/logo.svg'
import Dropzone from '../../components/Dropzone';

interface Item {
  id: number
  title: string
  image_url: string
}

interface UF {
  id: number
  initials: string
  name: string
}

interface City {
  id: number
  name: string
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

const CreatePoint: React.FC = () => {

  const [items, setItems] = useState<Item[]>([])
  const [ufs, setUfs] = useState<UF[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [selectedFile, setSelectedFile] = useState<File>()

  const [initialPosition, setInitialPosition] = useState<[number,number]>([0,0])

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  })

  const [selectedUf, setSelectedUf] = useState<string>('0')
  const [selectedCity, setSelectedCity] = useState<string>('0')
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0])

  const history = useHistory()

  useEffect(()=>{
    navigator.geolocation.getCurrentPosition(position => {
      const {latitude, longitude} = position.coords
    setInitialPosition([latitude, longitude]) 

    })
  }, [])

  useEffect(()=>{
    api.get('/items')
      .then(response => {
        setItems(response.data)
      })
  }, [])

  useEffect(()=> {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados/?orderBy=nome')
      .then(response => {
        const ufs = response.data.map(uf => {
          return {
            id: uf.id,
            initials: uf.sigla,
            name: uf.nome
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
            id: city.id,
            name: city.nome
          }
        })
        setCities(cities)
      })
  },[selectedUf])

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(event.target.value)
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(event.target.value)
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setSelectedPosition([event.latlng.lat, event.latlng.lng])
  }

  function handleImputChange(event: ChangeEvent<HTMLInputElement>) {
    const {name, value} = event.target
    setFormData({...formData, [name]: value})
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.includes(id)
    if (alreadySelected) {
      const filteredItems = selectedItems.filter(item => item !== id)
      setSelectedItems([...filteredItems])
    } else {
      setSelectedItems([...selectedItems,id])
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const {name, email, whatsapp} = formData
    const uf = selectedUf
    const city = selectedCity
    const [latitude, longitude] = selectedPosition
    const items = selectedItems

    const data = new FormData();
    data.append('name', name)
    data.append('email', email)
    data.append('whatsapp', whatsapp)
    data.append('uf', uf)
    data.append('city', city)
    data.append('latitude', String(latitude))
    data.append('longitude', String(longitude))
    data.append('items', items.join(','))
    
    if (selectedFile) {
      data.append('image', selectedFile)
    }

    await api.post('points', data)
    alert('Ponto de coleta criado')
    history.push('/')
  }

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta"/>
        <Link to="/">
          <FiArrowLeft/>
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br/> ponto de coleta</h1>

        <Dropzone onFileUploaded={setSelectedFile}/>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>
        </fieldset>

        <div className="field">
          <label htmlFor="name">Nome da entidade</label>
          <input 
          type="text"
          name="name"
          id="name"
          onChange={handleImputChange}
          />
        </div>

        <div className="field-group">
          <div className="field">
            <label htmlFor="email">E-mail</label>
            <input 
            type="email"
            name="email"
            id="email"
            onChange={handleImputChange}
            />
          </div>
          <div className="field">
            <label htmlFor="whatsapp">Whatsapp</label>
            <input 
            type="text"
            name="whatsapp"
            id="whatsapp"
            onChange={handleImputChange}
            />
          </div>
        </div>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={12} onClick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition}>
            </Marker>
          </Map>

          <div className="field-group">
              <div className="field">
                <label htmlFor="uf">Estado</label>
                <select name="uf" id="uf" value={selectedUf} onChange={handleSelectUf}>
                  <option value="0">Selecione um estado</option>
                  {
                    ufs.map(uf => (
                    <option key={uf.id} value={uf.initials}>{`${uf.initials} - ${uf.name}`}</option>
                    ))
                  }
                </select>
              </div>
              <div className="field">
                <label htmlFor="city">Cidade</label>
                <select name="city" id="city" value={selectedCity} onChange={handleSelectCity}>
                  <option value="0">Selecione uma cidade</option>
                  {
                    cities.map(city => (
                      <option key={city.id} value={city.name}>{city.name}</option>
                    ))
                  }
                </select>
              </div>
            </div>        
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {
              items.map(item => (
                  <li 
                    key={item.id} 
                    onClick={()=>{handleSelectItem(item.id)}}
                    className={selectedItems.includes(item.id) ? 'selected': ''}
                  >
                    <img src={item.image_url} alt={item.title}/>
                    <span>{item.title}</span>
                  </li>                  
                )
              )
            }
          </ul>

        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
}

export default CreatePoint;