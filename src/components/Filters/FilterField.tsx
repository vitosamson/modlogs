import React, { ChangeEvent, FormEvent, useCallback } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import styles from './filters.module.scss';

interface Props {
  label: string;
  disabled?: boolean;
  localValue?: string; // the value stored in local state while editing
  actualValue?: string; // the value from the route query param
  placeholder: string;
  onSubmit(evt: FormEvent): void;
  onChange(value: string): void;
  onClear(): void;
}

export default function FilterField({
  label,
  disabled,
  localValue,
  actualValue,
  placeholder,
  onSubmit,
  onChange,
  onClear,
}: Props) {
  const handleChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      onChange(evt.currentTarget.value);
    },
    [onChange]
  );

  return (
    <Form onSubmit={onSubmit}>
      <fieldset disabled={disabled}>
        <Form.Group className={styles['filter-field']}>
          <InputGroup>
            {actualValue && (
              <InputGroup.Prepend>
                <InputGroup.Text onClick={disabled ? undefined : onClear}>
                  {label}
                  <span className={styles['clear-filter']}> &times;</span>
                </InputGroup.Text>
              </InputGroup.Prepend>
            )}

            <Form.Control
              type="text"
              value={localValue}
              placeholder={placeholder}
              onChange={handleChange}
            />
          </InputGroup>
        </Form.Group>
      </fieldset>
    </Form>
  );
}
