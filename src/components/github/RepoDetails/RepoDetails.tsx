import {Repository} from '@/types/github';
import {HeadedCard, HeadedLink, VariantEnum} from "headed-ui";

interface RepoDetailsProps {
    repository: Repository;
}

export default function RepoDetails({repository}: RepoDetailsProps) {
    return (
        <HeadedCard variant={VariantEnum.Primary} width={'100%'}>
            <h1 style={{margin: 0}}>{repository.name}</h1>
            <HeadedLink
                href={repository.html_url}
                variant={VariantEnum.Primary}
            >
                View on GitHub
            </HeadedLink>
            {repository.description && (
                <p>
                    {repository.description}
                </p>
            )}

            <HeadedCard className={'flex justify-between'} variant={VariantEnum.Outline} height={'auto'} width={'100%'}>
                <div>
          <span>
            Stars : {repository.stargazers_count}
          </span>
                </div>

                <div>
          <span>
            Forks : {repository.forks_count}
          </span>
                </div>

                {repository.language && (
                    <div>
            <span>
              Language : {repository.language}

            </span>
                    </div>
                )}

                <div>
          <span>
            Private {repository.private ? 'Yes' : 'No'}
          </span>
                </div>
            </HeadedCard>

            <div className={'flex justify-between'}>
                <p>
                    Created: {new Date(repository.created_at).toLocaleDateString()}
                </p>
                <p>
                    Updated: {new Date(repository.updated_at).toLocaleDateString()}
                </p>
            </div>
        </HeadedCard>
    );
}
