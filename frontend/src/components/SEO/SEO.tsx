import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  pathname?: string;
  image?: string;
}

const defaultMeta = {
  title: 'PlanLab - Master Classical Planning Algorithms',
  description: 'Learn AI planning algorithms interactively. Visualize BFS, A*, and heuristics. Write PDDL domains and solve planning problems.',
  image: '/og-image.png',
  siteUrl: 'https://planlab.dev',
};

export function SEO({ 
  title = defaultMeta.title, 
  description = defaultMeta.description,
  pathname = '',
  image = defaultMeta.image 
}: SEOProps) {
  const seo = {
    title: title === defaultMeta.title ? title : `${title} | PlanLab`,
    description,
    image: `${defaultMeta.siteUrl}${image}`,
    url: `${defaultMeta.siteUrl}${pathname}`,
  };

  return (
    <Helmet>
      {/* Basic */}
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="image" content={seo.image} />

      {/* Open Graph */}
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta property="og:image" content={seo.image} />
      <meta property="og:url" content={seo.url} />
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
      <meta name="twitter:image" content={seo.image} />

      {/* Favicon */}
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <link rel="alternate icon" href="/favicon.ico" />
    </Helmet>
  );
}
