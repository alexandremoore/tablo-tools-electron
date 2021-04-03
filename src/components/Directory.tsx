import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

export default function Directory(prop) {
  const { label, value, onClick, onChange, disabled } = prop;

  return (
    <div className="d-flex flex-row">
      <div>
        <InputGroup size="sm">
          <InputGroup.Prepend>
            <InputGroup.Text title={label} style={{ width: '110px' }}>
              {label}
            </InputGroup.Text>
          </InputGroup.Prepend>
          <Form.Control
            type="text"
            value={value}
            placeholder={`Enter ${label}`}
            style={{ width: '350px' }}
            onChange={onChange}
            disabled={disabled}
          />
          <InputGroup.Append>
            <Button
              size="xs"
              variant="outline-secondary"
              onClick={onClick}
              disabled={disabled}
            >
              <span className="fa fa-folder-open" />
            </Button>
          </InputGroup.Append>
        </InputGroup>
      </div>
    </div>
  );
}
