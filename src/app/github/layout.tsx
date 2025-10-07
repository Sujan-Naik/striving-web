'use client'
import {useSession} from "next-auth/react";
import {UserProvider} from "@/context/UserContext";
import React from "react";
import {HeadedCard, HeadedLink, VariantEnum} from "headed-ui";

export default function Layout({children}: { children: React.ReactNode }) {
    const {data: session, status} = useSession();

    if (status === "loading") return <div>Loading...</div>;
    if (!session?.user?.name)
        return (
            <HeadedCard variant={VariantEnum.Primary} width={'100%'} className={'center-column'}><HeadedLink
                variant={VariantEnum.Primary} href={'/login'}> Please Login </HeadedLink></HeadedCard>
        )

    return (
        <UserProvider username={session.user.name}>
            {children}
        </UserProvider>
    );
}