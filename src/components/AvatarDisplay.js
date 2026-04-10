import React from 'react';

export default function AvatarDisplay({ avatarString, style = {} }) {
  if (!avatarString) return <span style={style}>👤</span>;

  if (avatarString.startsWith('data:image')) {
    return (
      <img 
        src={avatarString} 
        alt="Avatar"
        className="avatar-image"
        style={{
          width: '1em',
          height: '1em',
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'inline-block',
          ...style
        }} 
      />
    );
  }

  return <span style={style}>{avatarString}</span>;
}
