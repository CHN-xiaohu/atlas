import {memo, useContext} from "react";
import {ChatWindow} from "./ChatWindow";
import {useInfiniteQuery, useQuery} from "react-query";
import {QuotationContext} from "../Context";
import {Spinner} from "pages/common/Spinner";

export const Comment = memo(() => {
    const {activeQuotation, activeCardId} = useContext(QuotationContext);
    const isActive = activeCardId != null;
    const {data: users} = useQuery(["users"], {
        placeholderData: [],
        staleTime: 4 * 60 * 60 * 1000,
        cacheTime: 4 * 60 * 60 * 1000,
    });

    const {data: lead} = useQuery(
        [
            "leads",
            {
                method: "byId",
                _id: activeQuotation?.lead,
            },
        ],
        {
            enabled: activeQuotation?.lead != null,
        },
    );

    const {data: commentsRaw, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage} = useInfiniteQuery(
        [
            "comments",
            {
                method: "byIds",
                id: activeCardId,
            },
        ],
        {
            enabled: isActive,
            keepPreviousData: true,
            getNextPageParam: (lastPage, _pages) => lastPage.nextPage,
        },
    );
    const comments = commentsRaw == null ? [] : commentsRaw?.pages.map(page => page.data).flat();

    if (isFetching && !isFetchingNextPage && comments.length === 0) {
        return <Spinner />;
    }

    const commentsWithUsers = comments.map(comment => ({
        ...comment,
        author: users.find(user => user.login === comment.author),
    }));
    return !isActive ? null : (
        <ChatWindow
            id={activeCardId}
            lead={lead}
            loading={isFetching}
            comments={commentsWithUsers}
            fetchNextPage={fetchNextPage}
            hasNextPage={hasNextPage}
        />
    );
});
