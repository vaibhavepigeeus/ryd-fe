import './elements.css';

export default function SectionElement({ element }) {
  const { padding, background } = element.props;

  return (
    <div
      className="el-section"
      style={{ padding, background }}
    >
      <p className="el-section-placeholder">Section — drop elements here</p>
    </div>
  );
}
