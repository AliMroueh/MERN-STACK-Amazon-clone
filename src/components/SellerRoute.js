import React from 'react';
import { useSelector } from 'react-redux';
// import { Redirect, Route } from 'react-router-dom';
import { Navigate } from 'react-router-dom';


const SellerRoute = ({children}) =>{
    const userSignin = useSelector((state) => state.userSignin);
    const {userInfo} = userSignin;
    return userInfo && userInfo.isSeller ? children : <Navigate to="/signin" />
}

export default SellerRoute;

// export default function SellerRoute({ component: Component, ...rest }) {
//   const userSignin = useSelector((state) => state.userSignin);
//   const { userInfo } = userSignin;
//   return (
//     <Route
//       {...rest}
//       render={(props) =>
//         userInfo && userInfo.isSeller ? (
//           <Component {...props}></Component>
//         ) : (
//           <Redirect to="/signin" />
//         )
//       }
//     ></Route>
//   );
// }