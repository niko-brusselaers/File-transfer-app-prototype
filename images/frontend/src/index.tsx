import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {createBrowserRouter,RouterProvider } from "react-router-dom"
import Root from './Root';
import UploadPage from './core/pages/uploadpage/UploadPage';
import WebRTCTransferPage from './core/pages/WebRTCTransferPage/WebRTCTransferPage';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root/>,
    children: [
      {
        path: "/",
        element: <UploadPage/>
      },
      {
        path: "/webrtc-transfer",
        element: <WebRTCTransferPage/>
      }
    

    ]
  }
])


const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
);

