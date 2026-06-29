import './elements.css';

export default function SpacerElement({ element }) {
  const { height } = element.props;

  return <div className="el-spacer" style={{ height }} />;
}
