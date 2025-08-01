import {HeadedCard, HeadedLink, VariantEnum} from 'headed-ui';

export default function Header() {
  return (
    <header
      className="relative bg-cover bg-center py-8 px-6"
      style={{ backgroundImage: 'url(/banner.gif)' }}
    >
      <div
  style={{
    backgroundColor: 'var(--base-background)',
    opacity: 0.9,
    borderRadius: 'var(--border-radius)',
    display: 'flex',
    flexDirection: 'row'
  }}
>
  <HeadedCard variant={VariantEnum.Primary} width={"20%"}>
    <h1
      className="text-4xl font-bold mb-2 "
      style={{ color: 'var(--foreground-primary)' }}
    >
      Striving
    </h1>
    <p
      className="text-lg mb-1 "
      style={{ color: 'var(--foreground-secondary)' }}
    >
      Constantly and Endlessly Striving
    </p>
    <small style={{ color: 'var(--foreground-tertiary)' }}>
      Made by Sujan Naik
    </small>
  </HeadedCard>
        <HeadedCard variant={VariantEnum.Primary} width={"80%"} style={{display: 'flex', alignItems: 'center'}}>
          <HeadedLink variant={VariantEnum.Primary} href="/">Home</HeadedLink>
      <HeadedLink variant={VariantEnum.Primary} href="/calendar">Calendar</HeadedLink>
      <HeadedLink variant={VariantEnum.Primary} href="/github">GitHub</HeadedLink>
      <HeadedLink variant={VariantEnum.Primary} href="/github/projects">Projects</HeadedLink>
      <HeadedLink variant={VariantEnum.Primary} href="/gmail">Gmail</HeadedLink>
      <HeadedLink variant={VariantEnum.Primary} href="/llm">LLM</HeadedLink>
      <HeadedLink variant={VariantEnum.Primary} href="/llm/github">LLM GitHub</HeadedLink>
      <HeadedLink variant={VariantEnum.Primary} href="/spotify">Spotify</HeadedLink>
      <HeadedLink variant={VariantEnum.Primary} href="/login">Login</HeadedLink>
      <HeadedLink variant={VariantEnum.Primary} href="/sign-out">Sign Out</HeadedLink>
          </HeadedCard>
</div>
    </header>
  );
}