import {memo} from "react";
import styled from "styled-components";
import {Avatar} from "antd";
import {getImageLink} from "Helper";

const common = `
    display: inline-grid;
    justify-items: stretch;
    align-items: stretch;
    grid-gap: 1px 1px;
`;

const Containers = [
    styled.div`
        ${common}
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        grid-template-areas: "item1";
    `,

    styled.div`
        ${common}
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        grid-template-areas:
            "item1 ."
            ". item2";
    `,

    styled.div`
        ${common}
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        grid-template-areas:
            "item1 ."
            "item2 item3";
    `,

    styled.div`
        ${common}
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 1fr 1fr;
        grid-template-areas:
            "item1 item2"
            "item3 item4";
    `,

    styled.div`
        ${common}
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        grid-template-areas:
            "item1 . item2"
            ". item3 ."
            "item4 . item5";
    `,

    styled.div`
        ${common}
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        grid-template-areas:
            "item1 . item2"
            ". item3 ."
            "item4 item5 item6";
    `,

    styled.div`
        ${common}
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        grid-template-areas:
            "item1 item2 item3"
            ". item4 ."
            "item5 item6 item7";
    `,

    styled.div`
        ${common}
        grid-template-columns: 1fr 1fr 1fr;
        grid-template-rows: 1fr 1fr 1fr;
        grid-template-areas:
            "item1 item2 item3"
            "item4 . item5"
            "item6 item7 item8";
    `,
];

const AvatarWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    grid-area: item${props => props.index + 1};
`;

export const GroupAvatar = memo(({avatars, className, style}) => {
    const finalAvatars = avatars.slice(0, 6);
    const Container = Containers[finalAvatars.length - 1];
    return (
        <Container className={className} style={style}>
            {avatars.map((avatar, index) => (
                <AvatarWrapper index={index}>
                    {typeof avatar === "string" ? (
                        <Avatar shape="square" src={getImageLink(avatar, "avatar_webp")} />
                    ) : (
                        avatar
                    )}
                </AvatarWrapper>
            ))}
        </Container>
    );
});
