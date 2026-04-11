// AvatarDisplay — renders an emoji string or a base64/url photo avatar
// Sizing: pass fontSize via style for emoji, or explicit px width/height for images.
// When used as a standalone avatar (not inside flowing text), pass size="120px" etc.

export default function AvatarDisplay({ avatarString, style = {}, size = null }) {
  if (!avatarString) return <span style={style}>👤</span>;

  if (avatarString.startsWith('data:image') || avatarString.startsWith('http')) {
    const imgSize = size || '1.8em';
    return (
      <img 
        src={avatarString} 
        alt="Avatar"
        style={{
          width: imgSize,
          height: imgSize,
          borderRadius: '50%',
          objectFit: 'cover',
          display: 'inline-block',
          flexShrink: 0,
          ...style
        }} 
      />
    );
  }

  return <span style={style}>{avatarString}</span>;
}
