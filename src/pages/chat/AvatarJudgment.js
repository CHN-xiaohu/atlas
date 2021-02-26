import {UserOutlined} from "@ant-design/icons";
import {Avatar} from "antd";
import {memo} from "react";
import {GroupAvatar} from "pages/common/GroupAvatar";
import {Avatar as MemberAvatar} from "../leads/contacts/Avatar";
import { getImageLink } from "Helper";

export const AvatarJudgment = memo(({isComment, isGroup, contacts, groupMembers, chat, number, manager}) => {
    if (isComment) {
        if (typeof manager === "object" && manager != null) {
            return <Avatar key={manager._id} size={32} src={getImageLink(manager?.avatar, "avatar_webp")} />;
        }
        if (chat.image != null && chat.image !== "undefined" && chat.image !== "null" && chat.image.length !== 0) {
            return <Avatar size={32} src={chat?.image} icon={<UserOutlined />}/>;
        }
        if (Array.isArray(contacts) && contacts.length > 0) {
            const contact = contacts.find(contact => (contact.whatsapp ?? contact.phone) === manager);
            return <MemberAvatar size={32} contact={contact ?? {}} />;
        }
        return <Avatar size={32} icon={<UserOutlined />} />;
    }
    if (isGroup && Array.isArray(contacts) && Array.isArray(groupMembers)) {
        const wrapperSize = 50;
        const itemSize = groupMembers.length > 4 ? 50 / 3 - 1 / 2 : 50 / 2 - 2 / 3;
        const avatars = groupMembers.map(member => {
            if (typeof member === "number") {
                const contact = contacts.find(contact => (contact.whatsapp ?? contact.phone) === member);
                return <MemberAvatar isCircle={false} contact={contact ?? {}} size={itemSize} />;
            } else {
                return <Avatar shape="square" src={member?.avatar} size={itemSize} />;
            }
        });
        return <GroupAvatar style={{width: `${wrapperSize}px`, height: `${wrapperSize}px`}} avatars={avatars} />;
    }
    if (!isGroup) {
        if (typeof manager === "object" && manager != null) {
            return <Avatar key={manager._id} size={50} shape="square" src={getImageLink(manager?.avatar, 'avatar_webp')} />;
        }
        if (chat.image != null && chat.image !== "undefined" && chat.image !== "null" && chat.image.length !== 0) {
            return <Avatar shape="square" size={50} src={chat?.image} icon={<UserOutlined />}/>;
        }
        if (Array.isArray(contacts) && contacts.length > 0) {
            const contact = contacts.find(contact => (contact.whatsapp ?? contact.phone) === number);
            return <MemberAvatar isCircle={false} size={50} contact={contact ?? {}} />;
        }
        return <Avatar shape="square" size={50} icon={<UserOutlined />} />;
    }
    return null;
});
