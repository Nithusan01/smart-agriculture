import {useSoil} from '../../contexts/SoilContext'
import { useEffect, useState } from 'react';

const SoilAdmin = () => {
  const [newSoil, setNewSoil,fetchSoilData] = useState(
    {
      soilType: '',
      phLevel: '',
      moistureLevel: '',
      nutrientContent: ''
    });
    const {addSoil,soilData} = useSoil();
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setNewSoil((prevState) => ({
        ...prevState,
        [name]: value
      }));
    };

    const handleSubmit = (e) => {
      e.preventDefault();
      try {
        const result = addSoil(newSoilType);
        if (result.success) {
          alert(result.message);
        } else {
          alert(result.error);
        }
        
      } catch (error) {
        console.error('Error adding soil data:', error);
        alert('An unexpected error occurred while adding soil data.');
        
      }
    }
    useEffect(()=>{
      console.log('Current soil data:', soilData);

    },[soilData])


  return (
    <div className='p-6 bg-white rounded-lg shadow-md border border-gray-200'>
      <h2 className='text-2xl font-semibold mb-4'>Soil Management</h2>
      <p className='text-gray-600 mb-4'>Manage soil data and conditions for optimal crop growth.</p>
      <button className='px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-300'>Add Soil Data</button>

      <div>
        <form className='mt-6' onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block text-gray-700 mb-2'>Soil Type</label>
            <input type='text' className='w-full px-3 py-2 border border-gray-300 rounded' placeholder='Enter soil type'value={newSoil.soilType} onChange={handleInputChange} />
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700 mb-2'>pH Level</label>
            <input type='number' className='w-full px-3 py-2 border border-gray-300 rounded' placeholder='Enter pH level'value={newSoil.phLevel}  onChange={handleInputChange} />
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700 mb-2'>Moisture Content</label>
            <input type='number' className='w-full px-3 py-2 border border-gray-300 rounded' placeholder='Enter moisture content (%)' value={newSoil.moistureLevel}  onChange={handleInputChange}/>
          </div>
          <div className='mb-4'>
            <label className='block text-gray-700 mb-2'>Nutrient Content</label>
            <textarea className='w-full px-3 py-2 border border-gray-300 rounded' placeholder='Enter nutrient content details' value={newSoil.nutrientContent} onChange={handleInputChange}></textarea>
          </div>
          <button type='submit' className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300'>Save Soil Data</button>
        </form>
      </div>
      <div className='p-6 bg-gray-50 rounded-lg mt-6 border border-gray-200'>
        <h3 className='text-xl font-semibold mb-4'>Existing Soil Data</h3>
        <p className='text-gray-600'>List of existing soil data entries will be displayed here.</p>
        

      </div>


        
    </div>
  )
}

export default SoilAdmin