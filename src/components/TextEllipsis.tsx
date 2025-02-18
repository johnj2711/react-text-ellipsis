import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

interface textEllipsisProps {
  content: string;
  onClickAction: (e: React.MouseEvent<HTMLSpanElement>) => void;
  rows?: number;
  dots?: string;
  expandText?: string;
  collapseText?: string;
}

const TextEllipsis = forwardRef(
  (
    {
      content,
      rows = 2,
      dots = '...',
      expandText = 'More',
      collapseText = '',
      onClickAction,
    }: textEllipsisProps,
    ref,
  ) => {
    const [text, setText] = useState(content);
    const [expanded, setExpanded] = useState(false);
    const [hasAction, setHasAction] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const actionRef = useRef<HTMLDivElement>(null);

    const actionText = expanded ? collapseText : expandText;

    const pxToNum = (value: string) => {
      if (!value) return 0;
      const match = value.match(/^\d*(\.\d*)?/);
      return match ? Number(match[0]) : 0;
    };

    // 复制容器
    const cloneContainer = () => {
      if (!rootRef.current || !rootRef.current.isConnected) return;

      const originStyle = window.getComputedStyle(rootRef.current);
      const container = document.createElement('div');
      const styleNames = Array.from(originStyle);

      styleNames.forEach((name) => {
        container.style.setProperty(name, originStyle.getPropertyValue(name));
      });

      container.style.position = 'fixed';
      container.style.zIndex = '-9999';
      container.style.top = '-9999px';
      container.style.height = 'auto';
      container.style.minHeight = 'auto';
      container.style.maxHeight = 'auto';

      container.innerText = content;
      document.body.appendChild(container);

      return container;
    };

    // 计算省略的文字
    const calcEllipsisText = (container: HTMLDivElement, maxHeight: number) => {
      const end = content.length;
      const actionHTML = expandText;

      const calcEllipse = () => {
        // calculate the former or later content
        const tail = (left: number, right: number): string => {
          if (right - left <= 1) {
            return content.slice(0, left) + dots;
          }

          const middle = Math.round((left + right) / 2);

          // Set the interception location
          container.innerText = content.slice(0, middle) + dots;

          container.innerHTML += actionHTML;

          // The height after interception still does not match the rquired height
          if (container.offsetHeight > maxHeight) {
            return tail(left, middle);
          }

          return tail(middle, right);
        };

        return tail(0, end);
      };

      return calcEllipse();
    };

    const calcEllipsis = () => {
      const container = cloneContainer() as HTMLDivElement;

      const { paddingBottom, paddingTop, lineHeight } = container.style;
      const maxHeight = Math.ceil(
        (Number(rows) + 0.5) * pxToNum(lineHeight) + pxToNum(paddingTop) + pxToNum(paddingBottom),
      );

      if (maxHeight < container.offsetHeight) {
        setHasAction(true);
        setText(calcEllipsisText(container, maxHeight));
      } else {
        setHasAction(false);
        setText(content);
      }

      document.body.removeChild(container);
    };

    const toggle = () => {
      setExpanded(!expanded);
    };

    const onClickActionHandler = (event: React.MouseEvent<HTMLSpanElement>) => {
      toggle();
      onClickAction(event);
    };

    const renderAction = () => (
      <span ref={actionRef} onClick={onClickActionHandler}>
        {actionText}
      </span>
    );

    useEffect(() => {
      calcEllipsis();

      window.addEventListener('resize', calcEllipsis);
      return () => {
        window.removeEventListener('resize', calcEllipsis);
      };
    }, [content, rows]);

    useImperativeHandle(ref, () => ({
      toggle,
    }));

    return (
      <div ref={rootRef} className="text-ellipsis w-full">
        {expanded ? content : text}
        {hasAction && renderAction()}
      </div>
    );
  },
);

export default TextEllipsis;
