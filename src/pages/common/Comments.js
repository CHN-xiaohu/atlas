import {memo, useState} from "react";
import moment from "moment";
import {Space, Avatar, Comment, Input} from "antd";
import styled from "styled-components";
import Linkify from "linkifyjs/react";
import {useDataMutation} from "../../hooks/useDataMutation";
import {useQuery, useQueryClient} from "react-query";
import {Spinner} from "./Spinner";
import {useTranslation} from "react-i18next";
import {useGlobalState} from "../../hooks/useGlobalState";
import {getImageLink} from "Helper";

const StyledComment = styled(Comment)`
    .ant-comment-inner {
        padding: 6px;
    }
`;

const CommentInput = memo(({id}) => {
    const queryClient = useQueryClient();
    const [text, setText] = useState("");
    const [user] = useGlobalState("user");
    const {t} = useTranslation();
    const {mutate: sendMessage} = useDataMutation("/comments/add", {
        onSuccess: () => {
            queryClient.invalidateQueries("comments");
        },
    });
    return (
        <Input
            prefix={<Avatar src={getImageLink(user?.avatar, "avatar_webp", user?.session)} size="small" />}
            //autoFocus
            value={text}
            onChange={({target}) => setText(target.value)}
            onPressEnter={() => {
                if (text != null && text.length !== 0) {
                    sendMessage({
                        text,
                        id,
                    });
                    setText("");
                }
            }}
            placeholder={t("common.typeHere")}
        />
    );
});

export const CommentsPanel = memo(({id, data: comments, displayTotalAmount = true}) => {
    const {t} = useTranslation();
    return (
        <Space direction="vertical" style={{display: "flex"}}>
            {displayTotalAmount && (
                <div>
                    {comments.length} {t("common.comments")}
                </div>
            )}
            <div>
                {comments.map(comment => (
                    <StyledComment
                        author={comment.author.shortName ?? comment.author.name}
                        avatar={
                            <Avatar src={getImageLink(comment.author.avatar, "avatar_webp", comment.author?.session)} />
                        }
                        content={<Linkify>{comment.text}</Linkify>}
                        datetime={moment(comment.time).format("D MMMM HH:ss")}
                        // actions={[<DeleteOutlined />]}
                    />
                ))}
            </div>
            <CommentInput id={id} />
        </Space>
    );
});

export const Comments = memo(({id, ...props}) => {
    const {data: users, isSuccess: usersLoaded} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });
    const {data: comments, isPlaceholderData} = useQuery(
        [
            "comments",
            {
                method: "byId",
                id,
            },
        ],
        {
            placeholderData: [],
            enabled: id != null,
        },
    );

    if (isPlaceholderData || !usersLoaded) {
        return <Spinner />;
    }

    return (
        <CommentsPanel
            id={id}
            data={comments.map(comment => ({
                ...comment,
                author: users.find(user => user.login === comment.author),
            }))}
            {...props}
        />
    );
});
