import React from 'react'
import { useSelector } from 'react-redux';
// import { Redirect, Route } from 'react-router'
import { Navigate } from 'react-router-dom';


const PrivateRoute = ({children}) =>{
    const userSignin = useSelector((state) => state.userSignin);
    const {userInfo} = userSignin;
    return userInfo ? children : <Navigate to="/signin" />
}

export default PrivateRoute;

// export default function PrivateRoute({component: Component, ...rest}) {
//     const userSignin = useSelector(state => state.userSignin);
//     const {userInfo} = userSignin;
//     return (
//         <Route
//             {...rest}
//             render={(props) => userInfo ? (
//                 // only render a component only if the user is sign in
//                 <Component {...props}></Component>
//             ) : (
//                 <Redirect to="/signin"/>
//             )}
//         ></Route>
//     )
// }
