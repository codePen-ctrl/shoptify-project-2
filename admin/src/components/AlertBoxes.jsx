//@ts-check

import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react"


/**
 * @typedef {"default" | "success" | "warning" | "error" | "info"} Type
 */

/**
 * @typedef {Object} TitleIcon
 * @property {string|null} [src]
 * @property {React.ReactNode} [icon]
 * @property {number} [size]
 */

/**
 * @typedef {"row" | "column"} Dir
 */

/**
 * @typedef {Object} AlertProps
 * @property {Type} [type]
 * @property {string} [setWidth]
 * @property {string} [setHeight]
 * @property {string} [title]
 * @property {string} [description]
 * @property {number} [rounded]
 * @property {React.CSSProperties} [style]
 * @property {string} [className]
 * @property {boolean} [showIcon]
 * @property {TitleIcon} [titleIcon]
 * @property {Dir} [itemDirection]
 * @property {React.ReactNode} [children]
 */


/**
 * @param {AlertProps} props
 */
export const AlertBox = (props)=>{
  const {
    type = "default",
    setWidth = '250px',
    setHeight = '200px',
    title="Title Here",
    description="Some description here...",
    rounded=10,
    style={},
    className=null,
    showIcon=true,
    children=null,
    itemDirection="row",
    titleIcon
  } = props;

  const iconSize = titleIcon?.size || 20;

  const defaultIcons = {
    default: <Info size={iconSize}/>,
    info: <Info size={iconSize} />,
    success: <CheckCircle size={iconSize} />,
    warning: <AlertTriangle size={iconSize} />,
    error: <XCircle size={iconSize} />
  };

  const iconColor = {
  default: "var(--bg-light)",
  success: "#16A34A",  
  warning: "#F59E0B",  
  error: "#DC2626",   
  info: "#2563EB",  
};

  const finalTitleIcon = {
    size: iconSize,
    icon: titleIcon?.icon || defaultIcons[type],
    src: titleIcon?.src || null
  };

  return <div 
            style={{
                minWidth: setWidth,
                maxWidth: '350px',
                minHeight: setHeight,
                borderRadius: `${rounded}px`,
                ...style
            }}
            className={`alert_box ${className}`}
         >
            <div className="icon" style={{background: iconColor[type], color: type == "default" ? 'var(--text)' : 'white'}}>
              {showIcon && (
                finalTitleIcon.icon ? finalTitleIcon.icon
                : finalTitleIcon.src ? <img src={finalTitleIcon.src} alt="icon" style={{ width: finalTitleIcon.size, height: finalTitleIcon.size }} />
                : null
              )}
            </div>
            {title && <h1>{title}</h1>}
            {description && <span>{description}</span>}

            <div className="btn_holder" style={{
              minHeight: '50px',
              display: 'flex',
              flexDirection: itemDirection,
              alignItems: 'center',
              justifyContent: 'space-evenly',
              padding: itemDirection == "row" ? "10px" : "none",
              gap: itemDirection == "row" ? "5px" : 'none',
            }}>{children}</div>
         </div>
}