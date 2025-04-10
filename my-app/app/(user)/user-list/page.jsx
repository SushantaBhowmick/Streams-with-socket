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

  // useEffect(() => {
  //   const fetchUsersStream = async () => {
  //     setLoading(true);
  //     const response = await fetch('http://localhost:4000/api/users');
  //     const reader = response.body.getReader();
  //     const decoder = new TextDecoder();

  //     let buffer = '';
  //     let isArrayStarted = false;

  //     const pushValidJson = (chunk) => {
  //       try {
  //         const parsed = JSON.parse(chunk);
  //         setUsers(prev => [...prev, parsed]);
  //       } catch (err) {
  //         console.warn('Skipping invalid JSON chunk:', chunk);
  //       }
  //     };

  //     while (true) {
  //       const { done, value } = await reader.read();
  //       console.log(done,value)
  //       if (done) break;

  //       const chunk = decoder.decode(value, { stream: true });
  //       buffer += chunk;

  //       // Remove array brackets from start/end
  //       if (!isArrayStarted) {
  //         const openBracketIndex = buffer.indexOf('[');
  //         if (openBracketIndex !== -1) {
  //           buffer = buffer.slice(openBracketIndex + 1);
  //           isArrayStarted = true;
  //         }
  //       }

  //       let splitIndex;
  //       while ((splitIndex = buffer.indexOf('},')) !== -1) {
  //         const jsonChunk = buffer.slice(0, splitIndex + 1);
  //         buffer = buffer.slice(splitIndex + 2); // skip over '},'

  //         pushValidJson(jsonChunk);
  //       }
  //     }

  //     // Final cleanup (last chunk)
  //     const lastChunk = buffer.replace(/\]$/, '').trim();
  //     if (lastChunk) {
  //       pushValidJson(lastChunk);
  //     }

  //     setLoading(false);
  //   };

  //   fetchUsersStream();
  // }, []);

  

  // useEffect(() => {
  //   const fetchStream = async () => {
  //     const response = await fetch("http://localhost:4000/api/users");
  //     const reader = response.body.getReader();
  //     const decoder = new TextDecoder();
  //     let buffer = "";

  //     while (true) {
  //       const { done, value } = await reader.read();
  //       if (done) break;

  //       buffer += decoder.decode(value, { stream: true });

  //       let lines = buffer.split("\n");
  //       buffer = lines.pop(); // Save incomplete line

  //       for (const line of lines) {
  //         if (!line.trim()) continue;
  //         try {
  //           const chunk = JSON.parse(line); // chunk is an array
  //           setUsers(prev => [...prev, ...chunk]);// Append each streamed user
  //           console.log(chunk)
  //         } catch (err) {
  //           console.error("Invalid JSON:", line);
  //         }
  //       }
  //     }
  //   };

  //   fetchStream();

  //       //socket emit
  //       socket.on("userCreated", (newUser) => {
  //         console.log("userlist");
  //         setUsers((prev) => [...prev, newUser]);
  //       });
    
  //       socket.on("userUpdated", (updatedUser) => {
  //         setUsers((prev) =>
  //           prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
  //         );
  //       });
    
  //       return () => {
  //         socket.off("userCreated"); // Cleanup on unmount
  //         socket.off("userUpdated");
  //       };
  // }, []);
  
  // const socket = io(ENDPOINT)
 
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
