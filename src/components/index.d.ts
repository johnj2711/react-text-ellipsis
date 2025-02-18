declare module 'react-text-ellipsis-new' {
    import React from 'react';

    interface TextEllipsisProps {
        content: string;
        onClickAction: (e: React.MouseEvent<HTMLSpanElement>) => void;
        rows?: number;
        dots?: string;
        expandText?: string;
        collapseText?: string;
    }

    const TextEllipsis: React.ForwardRefExoticComponent<TextEllipsisProps & React.RefAttributes<unknown>>;

    export default TextEllipsis;
}