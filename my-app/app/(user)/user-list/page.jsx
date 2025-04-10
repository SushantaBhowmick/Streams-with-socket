"use client";
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { FixedSizeList as List } from "react-window";
import UserCards from '@/components/UserCards'
// import socket from "../../../utils/socket";

import io from 'socket.io-client';
import socket from "@/utils/socket";

const ENDPOINT = 'http://localhost:4000';

const UserList = () => {
  const [users, setUsers] = useState([]);
  // const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const socketRef = useRef(null);

 
  useEffect(() => {
    const socket = io(ENDPOINT);
    socketRef.current = socket;
    setIsStreaming(true); 

    socket.on("dataChunk", (chunk) => {
      setUsers((prevData) => [...prevData, ...chunk]);
    });

    socket.on("endOfData", () => {
      console.log("All data received");
      setIsStreaming(false);
    });

    socket.on("streamStopped", () => {
      console.log("Stream manually stopped");
      setIsStreaming(false);
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
      setIsStreaming(false);
    });

    return () => {
      // Cleanup
      socket.emit("trigger"); // stop if still running
      socket.disconnect();
    };
  }, []);



  const Row = ({ index, style }) => {
    const user = users[index];
    if (!user) return null;
    return (
        <UserCards user={user} style={style} />
    );
  };

  const triggerFunc=()=>{
    if (socketRef.current) {
      setUsers([]); // Clear old user data
      setIsStreaming(true); // Show loading if needed
      socketRef.current.emit("trigger",100);
    }
  }
  
  return (
    <div>
 
 {/* <div className="user-card flex flex-wrap items-center justify-center">
 {users && users.map((user,i) => (
   <Link
     href={`/user-list/${user.id}`}
     key={i}
     style={{
       border: "1px solid #ccc",
       padding: "10px",
       width: "260px",
       margin: "10px",
       borderRadius: "5px",
     }}
   >
     <div className="">
       <img
         src="https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg?cs=srgb&dl=pexels-souvenirpixels-414612.jpg&fm=jpg"
         alt="User"
         className="w-12 h-12"
         style={{ borderRadius: "50%" }}
       />
     </div>
     <div className="">
       <h2>{user.name}</h2>
       <p>{user.email}</p>
     </div>
   </Link>
 ))}
</div> */}

<div>
      <h1 className="text-center text-xl font-bold my-4">User List</h1>
      <button onClick={triggerFunc}>Trigger to Backend</button>
   <div className="flex justify-center items-center gap-5">
   <List
        height={800}
        itemCount={users.length}
        itemSize={80}
        width={"100%"}
      >
        {Row}
      </List>
   </div>
    </div>

    </div>

  );
};

export default UserList;
