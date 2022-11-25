import React from 'react';
import { TimePicker } from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
const onChange = (time, timeString) => {
  console.log(time, timeString);
};
function Demo() {
  const timeDemo = '15:08:53';

  return (
    <TimePicker defaultValue={dayjs(timeDemo, 'HH:mm:ss')} size="large" />
  );
}

export default Demo;
