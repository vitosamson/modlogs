import React from 'react';
import styles from './filters.module.scss';

interface Props {
  type: { label: string; value: string };
  selected: boolean;
  className?: string;
  disabled?: boolean;
  onSelect(type: string): void;
}

export default function Action({
  type,
  selected,
  className,
  disabled,
  onSelect,
}: Props) {
  return (
    <label className={`${styles['action-type']} ${className || ''}`}>
      <input
        type="checkbox"
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(type.value)}
      />
      {type.label}
    </label>
  );
}
