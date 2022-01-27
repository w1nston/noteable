import { useEffect, useState, useRef } from 'react';
import type {
  ChangeEvent,
  DetailedHTMLProps,
  TextareaHTMLAttributes,
} from 'react';

export function ExpandableTextarea(
  props: DetailedHTMLProps<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >
) {
  const DEFAULT_HEIGHT = 80;
  let [value, setValue] = useState<string>('');
  let [height, setHeight] = useState<number>(DEFAULT_HEIGHT);
  let nodeRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (nodeRef.current) {
      let scrollHeight = nodeRef.current.scrollHeight;
      if (scrollHeight !== height) {
        setHeight(scrollHeight);
      }
    }
  }, [value]);

  return (
    <textarea
      {...props}
      ref={nodeRef}
      value={value}
      style={{
        height: `${height}px`,
      }}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
        setValue(event.target.value);
      }}
    />
  );
}
