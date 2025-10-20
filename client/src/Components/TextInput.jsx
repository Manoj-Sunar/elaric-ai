// src/components/TextInput.jsx
import React, { useRef, useEffect } from 'react';
import ReusableButton from './ReusableButton';
import { Send } from 'lucide-react';

const TextInput = ({ onSubmit, disabled = false }) => {
  const [value, setValue] = React.useState('');
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    ref.current.style.height = 'auto';
    ref.current.style.height = ref.current.scrollHeight + 'px';
  }, [value]);

  function submit() {
    const v = value.trim();
    if (!v) return;
    onSubmit(v);
    setValue('');
  }

  return (
    <div className="w-full">
      <div className="flex gap-3 items-end flex-col bg-[#262626] p-3 border border-gray-600 rounded-4xl min-h-[150px]">
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          placeholder="Describe the mobile app you want to build..."
          className="flex-1 min-h-[44px] max-h-[160px] resize-none w-full  p-3 text-medium text-gray-200 outline-none"
          disabled={disabled}
        />
        <ReusableButton
          onClick={submit}
          disabled={disabled}
          customClass="rounded-full p-2"
          label={<Send />}
        />
      </div>
    </div>
  );
};

export default TextInput;
