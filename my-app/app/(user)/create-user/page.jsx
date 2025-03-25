'use client'
import axios from "axios";
import React, { useState } from "react";
import socket from '../../../utils/socket'


const CreateUser = () => {
    const [name,setName]=useState("")
    const [email,setEmail]=useState("")
    const [password,setPassword]=useState("")
  const submitHandler = async(e) => {
    e.preventDefault();
    await axios.post('http://localhost:4000/api/create',{
        name,email,password
    }).then((res)=>{
        console.log(res)
        alert("User created successfully!")
        socket.emit("createUser",res.data.user)
    }).catch((err)=>{
        alert("error")
        console.log(error)
    })
  };

  return (
    <div>
      <div className="border border-gray-300 flex flex-col justify-center items-center min-h-screen">
        <form onSubmit={submitHandler}>
          <h1 className=" text-center text-3xl mb-5 font-bold">Create User</h1>
          <div className="border border-gray-200 p-10">
            <div className="py-5 flex gap-5">
              <label htmlFor="name">Name:</label>
              <input
                className="p-1  border border-gray-200"
                type="text"
                id="name"
                name="name"
                required
                value={name}
                onChange={(e)=>setName(e.target.value)}
              />
            </div>
            <div className="py-5 flex gap-5">
              <label htmlFor="email">Email:</label>
              <input
                className="p-1 border border-gray-200"
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e)=>setEmail(e.target.value)}
                required
              />
            </div>
            <div className="py-5 flex gap-5">
              <label htmlFor="password">Password:</label>
              <input
                className="p-1  border border-gray-200"
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e)=>setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center justify-center ">
              <button
                className="border border-green-400 p-3 bg-green-500"
                type="submit"
              >
                Create User
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
