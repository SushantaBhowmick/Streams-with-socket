'use client'
import Navbar from "@/components/Navbar";
import Image from "next/image";
import { useEffect, useState } from "react";
// import socket from '../utils/socket'

// const socket = io('http://localhost:5000'); 

export default function Home() {
  const [connectedClients, setConnectedClients] = useState(0);

  // useEffect(()=>{
  //   socket.on('connection',(count)=>{
  //     setConnectedClients(count);
  //   });
  // //   return () => {
  // //     socket.off('disconnect'); // Cleanup on unmount
  // // };
  // },[]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* <Navbar/> */}
     <h1 className="text-lg font-bold">
     This is our home page
     </h1>
    </div>
  );
}
