"use client"
import {HeadedCard, HeadedCarousel, VariantEnum} from "headed-ui";
import {
    FaGithub,
    FaGoogle,
    FaSpotify,
    FaRobot,
    FaEnvelope,
    FaCalendarAlt,
    FaYoutube,
    FaMusic,
    FaPodcast,
    FaHeart,
    FaList,
    FaCode,
    FaUsers,
    FaStar,
    FaBook,
    FaBrain,
    FaComments,
    FaLanguage,
    FaImage,
    FaGoogleDrive
} from "react-icons/fa";
import TypewriterHero from "@/components/TypewriterHero";

export default function Home() {
    return (
        <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
            <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">

                <TypewriterHero fullText={"Software for Software Engineers"}/>
                {/* GitHub Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <FaGithub /> GitHub
                    </h2>
                    <HeadedCarousel variant={VariantEnum.Primary}>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaCode className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">Repositories</h3>
                                    <p className="text-sm opacity-75">Manage your code</p>
                                </div>
                            </div>
                        </HeadedCard>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaUsers className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">Organizations</h3>
                                    <p className="text-sm opacity-75">Team collaboration</p>
                                </div>
                            </div>
                        </HeadedCard>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaStar className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">Stars</h3>
                                    <p className="text-sm opacity-75">Favorite projects</p>
                                </div>
                            </div>
                        </HeadedCard>
                    </HeadedCarousel>
                </section>

                {/* Google Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <FaGoogle /> Google
                    </h2>
                    <HeadedCarousel variant={VariantEnum.Primary}>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaEnvelope className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">Gmail</h3>
                                    <p className="text-sm opacity-75">Email service</p>
                                </div>
                            </div>
                        </HeadedCard>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaCalendarAlt className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">Calendar</h3>
                                    <p className="text-sm opacity-75">Schedule events</p>
                                </div>
                            </div>
                        </HeadedCard>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaGoogleDrive className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">Drive</h3>
                                    <p className="text-sm opacity-75">Cloud storage</p>
                                </div>
                            </div>
                        </HeadedCard>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaYoutube className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">YouTube</h3>
                                    <p className="text-sm opacity-75">Video platform</p>
                                </div>
                            </div>
                        </HeadedCard>
                    </HeadedCarousel>
                </section>

                {/* Spotify Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <FaSpotify /> Spotify
                    </h2>
                    <HeadedCarousel variant={VariantEnum.Primary}>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaMusic className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">Music</h3>
                                    <p className="text-sm opacity-75">Stream songs</p>
                                </div>
                            </div>
                        </HeadedCard>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaPodcast className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">Podcasts</h3>
                                    <p className="text-sm opacity-75">Audio shows</p>
                                </div>
                            </div>
                        </HeadedCard>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaHeart className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">Liked Songs</h3>
                                    <p className="text-sm opacity-75">Your favorites</p>
                                </div>
                            </div>
                        </HeadedCard>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaList className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">Playlists</h3>
                                    <p className="text-sm opacity-75">Custom collections</p>
                                </div>
                            </div>
                        </HeadedCard>
                    </HeadedCarousel>
                </section>

                {/* LLMs Section */}
                <section>
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                        <FaRobot /> LLMs
                    </h2>
                    <HeadedCarousel variant={VariantEnum.Primary}>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaBrain className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">GPT-4</h3>
                                    <p className="text-sm opacity-75">Advanced reasoning</p>
                                </div>
                            </div>
                        </HeadedCard>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaComments className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">Claude</h3>
                                    <p className="text-sm opacity-75">Conversational AI</p>
                                </div>
                            </div>
                        </HeadedCard>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaLanguage className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">Gemini</h3>
                                    <p className="text-sm opacity-75">Multimodal AI</p>
                                </div>
                            </div>
                        </HeadedCard>
                        <HeadedCard variant={VariantEnum.Primary}>
                            <div className="flex items-center gap-3 p-4">
                                <FaImage className="text-2xl" />
                                <div>
                                    <h3 className="font-semibold">DALL-E</h3>
                                    <p className="text-sm opacity-75">Image generation</p>
                                </div>
                            </div>
                        </HeadedCard>
                    </HeadedCarousel>
                </section>

            </main>
        </div>
    );
}