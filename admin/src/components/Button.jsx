import {Loader} from 'lucide-react';

/**
 * @typedef {"default" | "default-gradient" | "primary" | "primary-gradient" | "outline" | "outline-gradient" | "danger" | "success" | "ghost" | "link" | "link-color"} Variant
 * @typedef {"sm" | "md" | "lg" | "full"} Size
 */

/**
 * @param {{
 *          variant?: Variant,
 *          size?: Size,
 *          loading,
 *          disabled,
 *          rounded,
 *          style,
 *          onlyIcon,
 *          onClick
 *        }} props
 */

export const Button = ({variant = 'default',
                        size = 'md',
                        children = 'click me',
                        onClick=()=>{},
                        className = null,
                        loading=false,
                        disabled=false,
                        rounded=5,
                        style=null,
                        onlyIcon=false
                      })=>{


    return <button disabled={loading ? true : disabled}
                   className={`btn ${variant} btn-${size} ${className || ''}`} 
                   onClick={(e)=>onClick(e)}
                   style={{
                    width: size == "full" ? '90%' : 'none',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    padding: !onlyIcon ? (size == 'sm' && '4px 8px' || size == 'md' && '6px 12px' ||size == 'lg' && '8px 16px' ||size == 'full' && '10px 20px') : (size == 'sm' && '4px' || size == 'md' && '6px' ||size == 'lg' && '8px' ||size == 'full' && '10px'),
                    fontSize: size == 'sm' && '12px' || size == 'md' && '14px' ||size == 'lg' && '16px' ||size == 'full' && '18px',
                    borderRadius: `${rounded}px`,
                    ...style
                   }}
           >
            {
                loading ? <><Loader strokeWidth={3} size={size == 'sm' && 12 || size == 'md' && 16 ||size == 'lg' && 18 ||size == 'full' && 23 } style={{animation: 'spin linear infinite 1s'}}/> <span>Loading...</span></> : children
            }
           </button>
}