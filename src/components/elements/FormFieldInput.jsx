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

function ChoiceGroup({ className, children }) {
  return <div className={`el-form-choice-group${className ? ` ${className}` : ''}`}>{children}</div>;
}

function ChoiceOption({ id, className, children }) {
  return (
    <label className={`el-form-choice-option${className ? ` ${className}` : ''}`} htmlFor={id}>
      {children}
    </label>
  );
}

function ReadOnlyValue({ value, className, multiline = false }) {
  const isEmpty = value === undefined || value === null || value === '';
  const text = isEmpty ? '—' : String(value);

  return (
    <div
      className={`el-response-value${multiline ? ' el-response-value--multiline' : ''}${
        className ? ` ${className}` : ''
      }`}
    >
      {text}
    </div>
  );
}

function useFieldOptions(field) {
  const rawOptions = field.options?.length
    ? field.options
    : ['Option 1', 'Option 2', 'Option 3'];
  const options = rawOptions.filter((option) => String(option).trim());
  const displayOptions = options.length ? options : rawOptions;
  return displayOptions;
}

export function FormFieldInput({ field, value, onChange, className, id, readOnly = false }) {
  const displayOptions = useFieldOptions(field);

  if (readOnly) {
    if (field.type === 'textarea') {
      return <ReadOnlyValue value={value} className={className} multiline />;
    }

    if (field.type === 'dropdown') {
      return <ReadOnlyValue value={value || 'Not selected'} className={className} />;
    }

    if (field.type === 'multi_select') {
      const selected = Array.isArray(value) ? value : [];

      return (
        <ChoiceGroup className={`${className || ''} el-form-choice-group--readonly`.trim()}>
          {displayOptions.map((option, index) => (
            <ChoiceOption key={`${id}-opt-${index}`} id={`${id}-${index}`}>
              <input
                id={`${id}-${index}`}
                type="checkbox"
                checked={selected.includes(option)}
                disabled
                readOnly
              />
              <span>{option}</span>
            </ChoiceOption>
          ))}
        </ChoiceGroup>
      );
    }

    if (field.type === 'checkbox') {
      return (
        <ChoiceGroup className={`${className || ''} el-form-choice-group--readonly`.trim()}>
          <ChoiceOption id={id}>
            <input id={id} type="checkbox" checked={Boolean(value)} disabled readOnly />
            <span>{field.checkboxLabel || 'Yes'}</span>
          </ChoiceOption>
        </ChoiceGroup>
      );
    }

    if (field.type === 'radio') {
      return (
        <ChoiceGroup className={`${className || ''} el-form-choice-group--readonly`.trim()}>
          {displayOptions.map((option, index) => (
            <ChoiceOption key={`${id}-opt-${index}`} id={`${id}-${index}`}>
              <input
                id={`${id}-${index}`}
                type="radio"
                name={id}
                checked={value === option}
                disabled
                readOnly
              />
              <span>{option}</span>
            </ChoiceOption>
          ))}
        </ChoiceGroup>
      );
    }

    if (field.type === 'file') {
      return <ReadOnlyValue value={value || 'No file uploaded'} className={className} />;
    }

    return <ReadOnlyValue value={value} className={className} />;
  }

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
        {displayOptions.map((option, index) => (
          <option key={`${id}-opt-${index}`} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }

  if (field.type === 'multi_select') {
    const selected = Array.isArray(value) ? value : [];

    return (
      <ChoiceGroup className={className}>
        {displayOptions.map((option, index) => {
          const optionId = `${id}-${index}`;
          const checked = selected.includes(option);

          return (
            <ChoiceOption key={`${id}-opt-${index}`} id={optionId}>
              <input
                id={optionId}
                type="checkbox"
                checked={checked}
                onChange={(e) => {
                  const next = e.target.checked
                    ? [...selected, option]
                    : selected.filter((item) => item !== option);
                  onChange(next);
                }}
                onClick={stopFormInteraction}
                onMouseDown={stopFormInteraction}
                onFocus={stopFormInteraction}
              />
              <span>{option}</span>
            </ChoiceOption>
          );
        })}
      </ChoiceGroup>
    );
  }

  if (field.type === 'checkbox') {
    return (
      <ChoiceGroup className={className}>
        <ChoiceOption id={id}>
          <input
            id={id}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            onClick={stopFormInteraction}
            onMouseDown={stopFormInteraction}
            onFocus={stopFormInteraction}
          />
          <span>{field.checkboxLabel || 'Yes'}</span>
        </ChoiceOption>
      </ChoiceGroup>
    );
  }

  if (field.type === 'radio') {
    return (
      <ChoiceGroup className={className}>
        {displayOptions.map((option, index) => {
          const optionId = `${id}-${index}`;

          return (
            <ChoiceOption key={`${id}-opt-${index}`} id={optionId}>
              <input
                id={optionId}
                type="radio"
                name={id}
                value={option}
                checked={value === option}
                onChange={() => onChange(option)}
                onClick={stopFormInteraction}
                onMouseDown={stopFormInteraction}
                onFocus={stopFormInteraction}
              />
              <span>{option}</span>
            </ChoiceOption>
          );
        })}
      </ChoiceGroup>
    );
  }

  if (field.type === 'file') {
    return (
      <input
        id={id}
        type="file"
        className={className}
        onChange={(e) => onChange(e.target.files?.[0]?.name || '')}
        onClick={stopFormInteraction}
        onMouseDown={stopFormInteraction}
        onFocus={stopFormInteraction}
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
