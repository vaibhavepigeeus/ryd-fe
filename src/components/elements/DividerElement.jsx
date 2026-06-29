import './elements.css';

export default function DividerElement({ element }) {
  const { color } = element.props;

  return <hr className="el-divider" style={{ borderColor: color }} />;
}
