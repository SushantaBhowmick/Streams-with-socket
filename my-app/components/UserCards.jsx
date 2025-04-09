'use client'
import React from 'react'
import Link from "next/link";

const UserCards = ({ user, style }) => {
  return (
    <Link
      href={`/user-list/${user.id}`}
      style={{
        ...style,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        border: "1px solid #ccc",
        padding: "10px",
        margin: "5px",
        borderRadius: "5px",
      }}
    >
      <img
        src="https://images.pexels.com/photos/414612/pexels-photo-414612.jpeg"
        alt="User"
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          marginRight: "10px",
        }}
      />
      <div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    </Link>
  )
}

export default UserCards