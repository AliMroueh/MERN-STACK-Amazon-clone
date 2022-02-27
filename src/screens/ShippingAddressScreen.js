import React, { useState } from 'react'
import {useDispatch, useSelector} from 'react-redux'
import { saveShippingAddress } from '../actions/cartAction';
import CheckoutSteps from '../components/CheckoutSteps';
import { useNavigate } from '../../node_modules/react-router-dom/index';


export default function ShippingAddressScreen(props) {
    const navigate = useNavigate();
    const userSignin = useSelector(state => state.userSignin);
    const {userInfo} = userSignin;
    const cart = useSelector(state => state.cart);
    const {shippingAddress} = cart;

    const [lat, setLat] = useState(shippingAddress.lat);
    const [lng, setLng] = useState(shippingAddress.lng);
    const userAddressMap = useSelector((state) => state.userAddressMap);
    const { address: addressMap } = userAddressMap;
    // console.log(userInfo)
    if(!userInfo){
        navigate('/signin');
    }
    const [fullName, setFullName] = useState(shippingAddress.fullName || '');
    const [address, setAddress] = useState(shippingAddress.address || '');
    const [city, setCity] = useState(shippingAddress.city || '');
    const [postalCode, setPostalCode] = useState(shippingAddress.postalCode || '');
    const [country, setCountry] = useState(shippingAddress.country || '');
    const dispatch = useDispatch();
    const submitHandler = (e) =>{
        e.preventDefault();
        const newLat = addressMap ? addressMap.lat : lat;
        const newLng = addressMap ? addressMap.lng : lng;
        if (addressMap) {
          setLat(addressMap.lat);
          setLng(addressMap.lng);
        }
        let moveOn = true;
        if (!newLat || !newLng) {
          moveOn = window.confirm(
            'You did not set your location on map. Continue?'
          );
        }
        if (moveOn) {
          dispatch(
            saveShippingAddress({
              fullName,
              address,
              city,
              postalCode,
              country,
              lat: newLat,
              lng: newLng,
            })
          );
          navigate('/payment');
        }
      };
      const chooseOnMap = () => {
        dispatch(
            // saveShippingAddress({fullName, address, city, postalCode, country}));
            saveShippingAddress({
                fullName,
                address,
                city,
                postalCode,
                country,
                lat,
                lng,
              })
        );
        // navigate('/payment');
        navigate('/map');
        // TODO : dispatch save shipping address action
    };
    return (
        <div>
            <CheckoutSteps step1 step2></CheckoutSteps>
            <form className="form" onSubmit={submitHandler}>
                <div>
                    <h1>Shipping Address</h1>
                </div>
                <div>
                    <label htmlFor='fullName'>Full Name</label>
                    <input id='fullName' type="text" placeholder='Enter full name' value={fullName} onChange={(e) => setFullName(e.target.value)} required></input>
                </div>
                <div>
                    <label htmlFor='address'>Address</label>
                    <input id='address' type="text" placeholder='Enter address' value={address} onChange={(e) => setAddress(e.target.value)} required></input>
                </div>
                <div>
                    <label htmlFor='city'>City</label>
                    <input id='city' type="text" placeholder='Enter city' value={city} onChange={(e) => setCity(e.target.value)} required></input>
                </div>
                <div>
                    <label htmlFor='postalCode'>Postal Code</label>
                    <input id='postalCode' type="text" placeholder='Enter postalCode' value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required></input>
                </div>
                <div>
                    <label htmlFor='country'>Country</label>
                    <input id='country' type="text" placeholder='Enter country' value={country} onChange={(e) => setCountry(e.target.value)} required></input>
                </div>
                
                <div>
          <label htmlFor="chooseOnMap">Location</label>
          <button type="button" onClick={chooseOnMap}>
            Choose On Map
          </button>
        </div>
                <div>
                    <label/>
                    <button className="primary" type="submit">Continue</button>
                </div>
            </form>
        </div>
    )
}
