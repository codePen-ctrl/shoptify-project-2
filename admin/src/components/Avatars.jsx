//@ts-check
/**
 * 
 * @typedef {Object} Avatar
 * @property {string} [image]
 * @property {string} [size]
 * @property {number} [iconSize]
 * @property {React.CSSProperties} [style]
 * @property {(image: string)=>void} [onClick]
 */

import { UserCircle2Icon } from "lucide-react";
import React from "react"
import blank from '../assets/blank_profile.jpg';

/**
 * @param {Avatar} props
 */
export const AvatarPage = (props)=>{
    const {
        image=null,
        size="40px",
        style=null,
        iconSize=23,
        onClick=()=>{}
    } = props;

    const handleClick = ()=>{
        if(image){
            onClick(image);
        }
    }

    return <div onClick={handleClick} className="avatar"
                style={{
                    width: size,
                    aspectRatio: '1/1',
                    ...style
                }}
           >
            <img className="avatar_img" src={image ? image : blank} alt="loading...."/> 
           </div>
}