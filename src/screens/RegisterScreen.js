import React, { useEffect, useState } from 'react';
import {Link, useLocation, useNavigate} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux'
import { register } from '../actions/userAction';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';

export default function RegisterScreen(props) {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [name, setName] = useState('');
    const [confirmpassword, setConfirmPassword] = useState('');
    const [email,setEmail] = useState('');
    const [password, setPassword] = useState('')
    // const redirect = props.location.search ? props.location.search.split('=')[1] : '/';

    // this is in react router v6 instead of props.location.search
    const {search} = useLocation();
    // URLSearchParams convert it to string
    const redirectInUrl = new URLSearchParams(search).get('redirect');
    // here convert it to number
    const redirect = redirectInUrl ? redirectInUrl : '/';

    const userRegister = useSelector(state => state.userRegister);
    const {userInfo, loading, error} = userRegister;

    const submitHandler = (e) => {
        e.preventDefault();
        // TODO: signin action
        if(password !== confirmpassword){
            alert('Password and confirm password are not match');
        }else{
        dispatch(register(name, email, password));
        }
    };
    useEffect(() => {
        if(userInfo){
            navigate(redirect);
        }
    }, [navigate, redirect, userInfo]);
    return (
        <div>
            <form className="form" onSubmit={submitHandler}>
                <div>
                    <h1>Create Account</h1>
                </div>
                {loading && <LoadingBox></LoadingBox>}
                {error && <MessageBox variant='danger'>{error}</MessageBox>}
                <div>
                    <label htmlFor="name">Name</label>
                    <input
                    type="text"
                    id="name"
                    placeholder="Enter your name"
                    required
                    onChange={(e) => setName(e.target.value)}
                    ></input>
                </div>
                <div>
                    <label htmlFor="email">Email address</label>
                    <input
                    type="email"
                    id="email"
                    placeholder="Enter email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    ></input>
                </div>
                <div>
                    <label htmlFor="password">Password</label>
                    <input
                    type="password"
                    id="password"
                    placeholder="Enter password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    ></input>
                </div>
                <div>
                    <label htmlFor="confirmPassword">Confirm password</label>
                    <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Enter confirm password"
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    ></input>
                </div>
                <div>
                    <label/>
                    <button className="primary" type="submit">Register</button>
                </div>
                <div>
                    <label/>
                    <div>
                        Already have an account? {' '}
                        <Link to={`/signin?redirect=${redirect}`}>Sign-In</Link>
                    </div>
                </div>
            </form>
        </div>
    )
}
