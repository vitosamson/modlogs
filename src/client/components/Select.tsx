import * as React from 'react';
import * as ReactSelect from 'react-select';
export { Option } from 'react-select';

// https://github.com/JedWatson/react-select/issues/1120

interface Id {
  id: string;
}

export default function Select(props: ReactSelect.ReactSelectProps & Id) {
  const { id, ...selectProps } = props;
  return <ReactSelect {...selectProps} instanceId={id} />;
}
