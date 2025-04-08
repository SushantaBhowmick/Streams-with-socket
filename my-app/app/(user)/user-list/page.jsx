"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import socket from "../../../utils/socket";

const UserList = () => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    const fetchUser = async () => {
      // await axios.get("http://localhost:4000/api/users").then((res) => {
      //   console.log(res);
      //   setUsers(res.data.result);
      // });
      const res = await fetch("http://localhost:4000/api/users"); // Server-side
      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let result = "";
      let done = false;
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        result += decoder.decode(value, { stream: true });
      }

      const users = JSON.parse(result);
      console.log(users);
      setUsers(users);
    };
    fetchUser();

    //socket emit
    socket.on("userCreated", (newUser) => {
      console.log("userlist");
      setUsers((prev) => [...prev, newUser]);
    });

    socket.on("userUpdated", (updatedUser) => {
      setUsers((prev) =>
        prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
      );
    });

    return () => {
      socket.off("userCreated"); // Cleanup on unmount
      socket.off("userUpdated");
    };
  }, []);
  return (
    <div>
      <div className="user-card flex flex-wrap items-center justify-center">
        {users.map((user) => (
          <Link
            href={`/user-list/${user.id}`}
            key={user.email}
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
      </div>
    </div>
  );
};

export default UserList;
