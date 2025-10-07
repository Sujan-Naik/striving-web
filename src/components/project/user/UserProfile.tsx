import {IUser} from "@/types/project/User";
import Image from "next/image";
import {HeadedCard, HeadedLink, VariantEnum} from "headed-ui";
import {FaGithub} from "react-icons/fa";

export default function UserProfile({user}: { user: IUser }) {
    return <HeadedCard variant={VariantEnum.Outline} style={{display: 'flex', flexDirection: 'column'}}>
        <HeadedCard variant={VariantEnum.Outline} style={{display: 'flex', flexDirection: 'row'}}>
            <p>{user.username}</p>
            <Image width={64} height={64} src={user.avatarUrl!} alt={`${user.username}'s github picture`}
                   style={{borderRadius: '50%'}}/>
        </HeadedCard>
        <HeadedCard variant={VariantEnum.Outline} style={{display: 'flex', flexDirection: 'row'}}>
            <p>{user.githubId}</p>
            <HeadedLink variant={VariantEnum.Outline}
                        href={`https://github.com/${user.githubId}`}><FaGithub/></HeadedLink>
        </HeadedCard>
    </HeadedCard>
}