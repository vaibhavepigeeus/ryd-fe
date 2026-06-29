import { useBuilderOptional } from '../../hooks/useBuilderOptional';
import { stopFormInteraction } from './FormFieldInput';
import './elements.css';

function buildMapEmbedUrl(address) {
  if (!address?.trim()) return '';
  return `https://maps.google.com/maps?q=${encodeURIComponent(address.trim())}&output=embed`;
}

export default function MapElement({ element, isSelected }) {
  const builder = useBuilderOptional();
  const { address, height = 300 } = element.props;
  const embedUrl = buildMapEmbedUrl(address);

  const handleAddressChange = (e) => {
    if (!builder) return;
    builder.dispatch({
      type: 'UPDATE_ELEMENT',
      payload: { id: element.id, props: { address: e.target.value } },
    });
  };

  return (
    <div className={`el-map${isSelected ? ' el-map--selected' : ''}`}>
      {builder && (
        <input
          type="text"
          className="el-map-address"
          value={address}
          onChange={handleAddressChange}
          onClick={stopFormInteraction}
          onMouseDown={stopFormInteraction}
          onFocus={stopFormInteraction}
          placeholder="Enter address or location"
        />
      )}
      <div className="el-map-frame" style={{ height: `${height}px` }}>
        {embedUrl ? (
          <iframe
            title={`Map: ${address}`}
            src={embedUrl}
            className="el-map-iframe"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="el-map-placeholder">
            <span className="el-map-placeholder-icon">📍</span>
            <span>Enter an address to show the map</span>
          </div>
        )}
      </div>
    </div>
  );
}
