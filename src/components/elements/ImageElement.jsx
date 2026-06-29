import './elements.css';

export default function ImageElement({ element }) {
  const { src, alt } = element.props;

  return (
    <div className="el-image-wrap">
      <img className="el-image" src={src} alt={alt} draggable={false} />
    </div>
  );
}
