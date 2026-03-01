  // @ts-check

  /**
   * @typedef {"text" | "password" | "email" | "search" | "tel" | "file"} Type
   * @typedef {"sm" | "md" | "lg" | "full"} Size
   */

  /**
   * @typedef {Object} InputProps
   * @property {Type} [type]
   * @property {Size} [size]
   * @property {string} [label]
   * @property {string} [value]
   * @property {(value: string) => void} [onChange]
   * @property {(value: string) => void} [onSearch]
   * @property {string} [placeholder]
   * @property {string} [error]
   * @property {string} [helperText]
   * @property {boolean} [disabled]
   * @property {boolean} [required]
   * @property {boolean} [setIconRight]
   * @property {number} [iconSize]
   * @property {number} [rounded]
   * @property {number} [maxLength]
   * @property {string} [fileType]
   * @property {React.Component | string} [icon]
   * @property {React.CSSProperties} [style]
   * 
   * 
   * @typedef {Object} TextField
   * @property {Size} [size]
   * @property {string} [label]
   * @property {string} [value]
   * @property {(value: string) => void} [onChange]
   * @property {string} [placeholder]
   * @property {string} [setWidth]
   * @property {string} [setHeight]
   * @property {string} [error]
   * @property {string} [helperText]
   * @property {boolean} [disabled]
   * @property {boolean} [required]
   * @property {number} [rounded]
   * @property {boolean} [setResize]
   * @property {React.CSSProperties} [style]
   * 
   * 
   * @typedef {Object} OtpInput
   * @property {Size} [size]
   * @property {string} [label]
   * @property {(value: string) => void} [onChange]
   * @property {string} [placeholder]
   * @property {string} [error]
   * @property {string} [helperText]
   * @property {boolean} [disabled]
   * @property {boolean} [required]
   * @property {number} [rounded]
   * @property {number} [digitAmt]
   * @property {React.CSSProperties} [style]

   */

  import { Search, PenBox, Lock, Mail, Phone, Eye, EyeClosed, EyeOff, LeafyGreen } from "lucide-react";
  import { useEffect, useRef, useState } from "react";

  /**
   * @param {InputProps} props
   */
  export const Input = (props) => {

    const {
      label = "",
      type = "text",
      value = "",
      onChange = () => {},
      onSearch = () => {},
      placeholder = "",
      error = "",
      helperText = "",
      disabled = false,
      required = false,
      size = "md",
      setIconRight = false,
      iconSize = 20,
      rounded = 6,
      style = {},
      icon = null,
      maxLength= 255,
      fileType=null
    } = props;

    const [inputType, setInputType] = useState(type);
    const [Value, setValue] = useState(value);

    const sizeConfig = {
      sm: { height: "32px", fontSize: "14px", width: "180px", padding: "4px 8px" },
      md: { height: "40px", fontSize: "15px", width: "240px", padding: "5px 10px" },
      lg: { height: "48px", fontSize: "16px", width: "320px", padding: "8px 16px" },
      full: { height: "48px", fontSize: "16px", width: "100%", padding: "10px 20px"}
    };

    const icons = {
      text: <PenBox style={{flexShrink: 0}} size={iconSize}/>,
      password: <Lock style={{flexShrink: 0}} size={iconSize}/>,
      email: <Mail style={{flexShrink: 0}} size={iconSize}/>,
      search: <Search style={{flexShrink: 0}} size={iconSize}/>,
      tel: <Phone style={{flexShrink: 0}} size={iconSize}/>
    };

    const currentSize = sizeConfig[size];

    return (
      <div
        style={{
          width: currentSize.width,
          height: currentSize.height,
          borderRadius: `${rounded}px`,
          border: error ? "1px solid red" : "1px solid var(--border)",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
          padding: currentSize.padding,
          paddingRight: type == 'password' || 'search' ? '0%' : currentSize.padding,
          ...style
        }}
        className="input_main"
      >
        {label && <label style={{fontSize: `calc(${currentSize.fontSize} / 1.1)`}}>{label}</label>}

        <div
          className="input_holder"
          style={{
            width: '100%',
            height: `calc(${currentSize.height} - 2px)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            color: 'var(--text)',
            overflow: 'hidden',
            borderRadius: `${rounded}px`,
          }}
        >
          <span style={{flexShrink: 0}}>{icon != 'none' && !setIconRight && (icon ? icon : icons[type] || null)}</span>

          <input
            type={inputType}
            accept={fileType || undefined}
            maxLength={type !== "file" ? maxLength : undefined}
            value={type !== "file" ? Value : undefined}
            onChange={(e) => {
              if (type === "file") {
                onChange(e);
              } else {
                setValue(e.target.value);
                onChange(e.target.value);
              }
            }}
            disabled={disabled}
            placeholder={placeholder}
            required={required}
            style={{
              width: '100%',
              border: "none",
              outline: "none",
              fontSize: currentSize.fontSize,
              background: "transparent",
              color: 'var(--text)',
            }}
          />

          <span style={{flexShrink: 0}}>{icon != 'none' && setIconRight && (icon ? icon : icons[type] || null)}</span>

          {type === "password" && (
            <button
              className="show_icon"
              type="button"
              onClick={() =>
                setInputType(inputType === "password" ? "text" : "password")
              }
              style={{
                border: "none",
                cursor: "pointer"
              }}
            > 
              {inputType === 'password' ? <Eye size={iconSize}/> : <EyeOff size={iconSize}/>}
            </button>
          )}

          {type === "search" && (
            <button
              className="show_icon"
              type="button"
              onClick={()=>onSearch(Value)}
              style={{
                border: "none",
                cursor: "pointer"
              }}
            > 
              <Search size={iconSize}/>
            </button>
          )}
        </div>

        {helperText && !error && (
          <span className="text">{helperText}</span>
        )}

        {error && (
          <span className="text" style={{ color: "red" }}>
            {error}
          </span>
        )}
      </div>
    );
  };

  /**
   * 
   * @param {TextField} props
   */
  export const TextField = (props)=>{
    const {
      label = "",
      value = "",
      onChange = () => {},
      setWidth = null,
      setHeight = null,
      placeholder = "",
      error = "",
      helperText = "",
      disabled = false,
      required = false,
      size = "md",
      setResize = true,
      rounded = 6,
      style = {}
    } = props;

    const sizeConfig = {
      sm: { height: "32px", fontSize: "14px", width: "180px", padding: "4px 8px" },
      md: { height: "40px", fontSize: "15px", width: "240px", padding: "5px 10px" },
      lg: { height: "48px", fontSize: "16px", width: "320px", padding: "8px 16px" },
      full: { height: "40px", fontSize: "16px", width: "100%", padding: "10px 20px"}
    };

    const currentSize = sizeConfig[size];

    const [Value, setValue] = useState(value);

    return <div 
              className="textField_container"

              style={{
                fontSize: currentSize.fontSize,
                padding: currentSize.padding,
                borderRadius: `${rounded}px`,
                border: error ? "1px solid red" : "1px solid var(--border)",
                ...style
              }}
          >
            {label && <label style={{fontSize: `calc(${currentSize.fontSize} / 1.1)`}}>{label}</label>}
            <textarea 
              placeholder={placeholder} 
              required={required}
              disabled={disabled}
              value={Value}
              onChange={(e) =>{
                onChange(e.target.value);
                setValue(e.target.value);
              }}
              style={{
                minWidth: currentSize.width,
                minHeight: currentSize.height,
                width: setWidth || 'none',
                height: setHeight || 'none',
                resize: setResize ? "both" : "none"
              }}
            />
            {helperText && !error && (
              <span className="text">{helperText}</span>
            )}

            {error && (
              <span className="text" style={{ color: "red" }}>
                {error}
              </span>
            )}
          </div>
  }


/**
 * @param {OtpInput} props
 */
export const OtpInput = (props)=>{
  const {
    label = "",
    onChange = () => {},
    placeholder = "*",
    digitAmt = 4,
    error = "",
    helperText = "",
    disabled = false,
    required = false,
    size = "md",
    rounded = 6,
    style = {}
  } = props;

  const sizeConfig = {
    sm: { height: "32px", fontSize: "14px",padding: "20px", size: "20px" },
    md: { height: "40px", fontSize: "15px", padding: "25px", size: "25px" },
    lg: { height: "48px", fontSize: "16px", padding: "30px", size: "30px" },
    full: { height: "48px", fontSize: "16px", padding: "35px", size: "35px" }
  };

  const currentSize = sizeConfig[size];

  const input = useRef({});
  const [otp, setOtp] = useState(Array(digitAmt).fill(""));

  useEffect(()=>{
    onChange(otp.join(""));
  },[otp]);

  const handleChange = (e, i) => {
    const value = e.target.value;

    // allow numbers only
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[i] = value;
    setOtp(newOtp);

    // move next
    if (value && i < digitAmt - 1) {
      input.current[`inp_${i + 2}`]?.focus();
    }
  };

  const handleKeyDown = (e, i) => {
    if (e.key === "Backspace") {
      if (!otp[i] && i > 0) {
        input.current[`inp_${i}`]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").trim();

    if (!/^\d+$/.test(paste)) return;

    const newOtp = paste.slice(0, digitAmt).split("");

    while(newOtp.length < digitAmt){
      newOtp.push("");
    }

    setOtp(newOtp);
  };

  return (
    <div 
      className="otp_form"
      style={{
        height: currentSize.height,
        padding: currentSize.padding,
        border: error ? "1px solid red" : "1px solid var(--border)",
        borderRadius: `${rounded}px`,
        ...style
      }}
    >

      {label && <label style={{fontSize: `calc(${currentSize.fontSize} / 1.1)`}}>
        {label}
      </label>}

      {[...Array(digitAmt)].map((_, i)=>(
        <input 
          key={i}
          value={otp[i]}
          style={{
            width: currentSize.size,
            height: currentSize.size,
            display: 'inline',
            fontSize: currentSize.fontSize,
            textAlign: 'center',
          }}
          maxLength={1}
          placeholder={placeholder}
          className="otp_input"
          type="text"
          disabled={disabled}
          required={required}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onPaste={handlePaste}
          ref={(e)=>(input.current[`inp_${i + 1}`]=e)}
        />
      ))}

      {helperText && !error && (
        <span className="text">{helperText}</span>
      )}

      {error && (
        <span className="text" style={{ color: "red" }}>
          {error}
        </span>
      )}
    </div>
  );
};