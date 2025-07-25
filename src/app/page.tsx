import {HeadedButton, HeadedLink, VariantEnum} from "headed-ui";

export default function Home() {
    return (
        <div
            className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
                <HeadedLink variant={VariantEnum.Primary} href={'/calendar'}>Calendar</HeadedLink>
                <HeadedLink variant={VariantEnum.Primary} href={'/gmail'}>Gmail</HeadedLink>
                <HeadedLink variant={VariantEnum.Primary} href={'/spotify'}>Spotify</HeadedLink>
                <HeadedLink variant={VariantEnum.Primary} href={'/github'}>Github</HeadedLink>
            </main>
        </div>
    );
}
