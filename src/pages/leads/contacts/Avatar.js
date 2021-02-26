import {memo} from "react";
import styled from "styled-components";
import {getContrastColor} from "../../../Helper";

const greekAlphabets = ["α", "β", "γ", "δ", "ε", "ζ", "η", "θ", "ι", "κ", "λ", "μ", "ν", "ξ", "ο", "π", "ρ", "σ", "τ", "υ", "φ", "χ", "ψ", "ω"];

const Wrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    user-select: none;

    ${props => (props.size != null && `
        width: ${props.size}px;
        height: ${props.size}px;
        font-size: ${props.size * 0.5}px;
    `)}

    ${props => (props.isCircle
    ? `border-radius: 1000px;`
    : `border-radius: 2px;`
    )}

    ${props => (props.color != null && `
        color: ${props.color};
    `)}

    ${props => (props.background != null && `
        background: ${props.background};
    `)}
`;

const capital = (str) => str.slice(0, 1).toUpperCase() + str.slice(1);

const id2num = (id) => id.split("").reduce((acc, item) => {return parseInt(item, 16) + acc}, 0);

export const Avatar = memo(({
    contact,
    size = 30,
    isCircle = true,
    letters = 1,
    className,
    style
}) => {
    const background = contact?.background ?? "#ffffff";
    const contactName = (contact.contact_name == null || contact.contact_name.trim() === "")
    ? contact._id == null
        ? "?"
        : greekAlphabets[id2num(contact._id) % greekAlphabets.length]
    : capital(contact.contact_name.trim());
    const finalName = contactName.slice(0, 1) + contactName.slice(1, letters);

    return (
        <Wrapper
            className={className}
            size={size}
            isCircle={isCircle}
            color={getContrastColor(background)}
            background={background}
            style={style}
        >{finalName}</Wrapper>
    )
});
