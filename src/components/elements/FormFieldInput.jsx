export function stopFormInteraction(e) {
  e.stopPropagation();
}

const INPUT_TYPE_MAP = {
  text: 'text',
  textarea: 'textarea',
  number: 'number',
  date: 'date',
  email: 'email',
};

export function FormFieldInput({ field, value, onChange, className, id }) {
  const handleChange = (e) => onChange(e.target.value);

  const commonProps = {
    id,
    value: value ?? '',
    onChange: handleChange,
    onClick: stopFormInteraction,
    onMouseDown: stopFormInteraction,
    onFocus: stopFormInteraction,
    className,
  };

  if (field.type === 'textarea') {
    return <textarea {...commonProps} rows={4} />;
  }

  if (field.type === 'dropdown') {
    return (
      <select {...commonProps} value={value ?? ''}>
        <option value="">Select an option</option>
      </select>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <input
        type="checkbox"
        checked={Boolean(value)}
        onChange={(e) => onChange(e.target.checked)}
        onClick={stopFormInteraction}
        onMouseDown={stopFormInteraction}
        onFocus={stopFormInteraction}
        className={className}
      />
    );
  }

  return (
    <input
      {...commonProps}
      type={INPUT_TYPE_MAP[field.type] || 'text'}
    />
  );
}
