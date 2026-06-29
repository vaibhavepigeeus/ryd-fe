import './elements.css';

export default function ImageElement({ element, isSelected }) {
  const { src, alt } = element.props;

  return (
    <div className={`el-image-wrap ${isSelected ? 'el-image-wrap--selected' : ''}`}>
      {src ? (
        <img className="el-image" src={src} alt={alt || 'Image'} draggable={false} />
      ) : (
        <div className="el-image-placeholder">
          <span className="el-image-placeholder-icon">🖼</span>
          <span>Select this block and upload an image from the right panel</span>
        </div>
      )}
    </div>
  );
}
