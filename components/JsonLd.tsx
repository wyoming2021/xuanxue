'use client';

interface JsonLdProps {
  data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

// 网站结构化数据
export function WebsiteJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: '玄语',
    alternateName: 'XuanYu',
    url: 'https://xuanyu.app',
    description: '玄语是一个在线玄学工具站，提供八字排盘、紫微斗数、塔罗占卜、每日运势等功能。',
    inLanguage: 'zh-CN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://xuanyu.app/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return <JsonLd data={data} />;
}

// 组织结构化数据
export function OrganizationJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '玄语',
    url: 'https://xuanyu.app',
    logo: 'https://xuanyu.app/logo.png',
    sameAs: [],
    description: '在线玄学工具站，融合传统命理学与现代科技。',
  };

  return <JsonLd data={data} />;
}

// 面包屑结构化数据
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return <JsonLd data={data} />;
}

// 八字排盘结构化数据
interface BaziJsonLdProps {
  name: string;
  description: string;
  url: string;
}

export function BaziJsonLd({ name, description, url }: BaziJsonLdProps) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${name}的八字排盘 - 玄语`,
    description,
    url,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
      description: '免费基础排盘',
    },
  };

  return <JsonLd data={data} />;
}

// 塔罗占卜结构化数据
export function TarotJsonLd({ description, url }: { description: string; url: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: '塔罗牌占卜 - 玄语',
    description,
    url,
    applicationCategory: 'LifestyleApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
      description: '免费塔罗占卜',
    },
  };

  return <JsonLd data={data} />;
}

// FAQ结构化数据
interface FaqItem {
  question: string;
  answer: string;
}

export function FaqJsonLd({ items }: { items: FaqItem[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return <JsonLd data={data} />;
}

// 如何做(HowTo)结构化数据
interface HowToStep {
  name: string;
  text: string;
  image?: string;
}

export function HowToJsonLd({
  name,
  description,
  steps,
  totalTime,
}: {
  name: string;
  description: string;
  steps: HowToStep[];
  totalTime?: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    totalTime,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      image: step.image,
    })),
  };

  return <JsonLd data={data} />;
}

// 服务结构化数据
export function ServiceJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: '玄语在线玄学服务',
    description: '提供八字排盘、紫微斗数、塔罗占卜、每日运势等在线玄学服务',
    provider: {
      '@type': 'Organization',
      name: '玄语',
    },
    areaServed: 'CN',
    serviceType: ['八字排盘', '紫微斗数', '塔罗占卜', '每日运势', '合婚配对'],
  };

  return <JsonLd data={data} />;
}

// 软件应用结构化数据
export function SoftwareAppJsonLd() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: '玄语 - 在线玄学工具',
    operatingSystem: 'Web',
    applicationCategory: 'LifestyleApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'CNY',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1234',
    },
  };

  return <JsonLd data={data} />;
}
