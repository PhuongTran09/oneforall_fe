import { useEffect } from 'react'
import { t } from '../../i18n/langStore'

export interface SEOHeadProps {
  title: string
  description: string
  canonicalUrl: string
  ogType?: 'website' | 'article'
  faqList?: { q: string; a: string }[]
  breadcrumbs?: { name: string; url: string }[]
  noindex?: boolean
  /** URL tương đối của 2 bản dịch (vd. { vi: '/youtube-to-mp4', en: '/en/youtube-to-mp4' }) → emit hreflang. */
  alternates?: { vi: string; en: string }
}

export function SEOHead({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  faqList,
  breadcrumbs,
  noindex = false,
  alternates,
}: SEOHeadProps) {
  useEffect(() => {
    // 1. Cập nhật Title
    document.title = title

    // 2. Cập nhật Meta Description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.setAttribute('name', 'description')
      document.head.appendChild(metaDesc)
    }
    metaDesc.setAttribute('content', description)

    // 3. Cập nhật Canonical
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', canonicalUrl)

    // 3b. Hreflang alternates (VI = default, không prefix)
    document.querySelectorAll('link[data-hreflang]').forEach((el) => el.remove())
    if (alternates) {
      const entries: { hreflang: string; href: string }[] = [
        { hreflang: 'vi', href: `https://oneforall.app${alternates.vi}` },
        { hreflang: 'en', href: `https://oneforall.app${alternates.en}` },
        { hreflang: 'x-default', href: `https://oneforall.app${alternates.vi}` },
      ]
      for (const entry of entries) {
        const link = document.createElement('link')
        link.setAttribute('rel', 'alternate')
        link.setAttribute('hreflang', entry.hreflang)
        link.setAttribute('href', entry.href)
        link.setAttribute('data-hreflang', entry.hreflang)
        document.head.appendChild(link)
      }
    }

    // 4. Cập nhật Robots
    let metaRobots = document.querySelector('meta[name="robots"]')
    if (!metaRobots) {
      metaRobots = document.createElement('meta')
      metaRobots.setAttribute('name', 'robots')
      document.head.appendChild(metaRobots)
    }
    metaRobots.setAttribute('content', noindex ? 'noindex, nofollow' : 'index, follow')

    // 5. Cập nhật Open Graph & Twitter Tags
    const ogTags: Record<string, string> = {
      'og:title': title,
      'og:description': description,
      'og:url': canonicalUrl,
      'og:type': ogType,
      'og:site_name': 'OneForAll',
      'twitter:card': 'summary_large_image',
      'twitter:title': title,
      'twitter:description': description,
    }

    for (const [key, value] of Object.entries(ogTags)) {
      const isProp = key.startsWith('og:')
      const selector = isProp ? `meta[property="${key}"]` : `meta[name="${key}"]`
      let el = document.querySelector(selector)
      if (!el) {
        el = document.createElement('meta')
        if (isProp) {
          el.setAttribute('property', key)
        } else {
          el.setAttribute('name', key)
        }
        document.head.appendChild(el)
      }
      el.setAttribute('content', value)
    }

    // 6. JSON-LD Structured Data (FAQPage & Breadcrumbs)
    const jsonLdElements: HTMLElement[] = []

    // Dọn dẹp bất kỳ script JSON-LD nào đã có sẵn trong DOM (từ prerender HTML hoặc từ trang trước)
    const existingFaq = document.getElementById('faq-jsonld')
    if (existingFaq) existingFaq.remove()

    const existingBreadcrumb = document.getElementById('breadcrumb-jsonld')
    if (existingBreadcrumb) existingBreadcrumb.remove()

    if (faqList && faqList.length > 0) {
      const faqSchema = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqList.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.a,
          },
        })),
      }

      const scriptFaq = document.createElement('script')
      scriptFaq.type = 'application/ld+json'
      scriptFaq.id = 'faq-jsonld'
      scriptFaq.text = JSON.stringify(faqSchema)
      document.head.appendChild(scriptFaq)
      jsonLdElements.push(scriptFaq)
    }

    if (breadcrumbs && breadcrumbs.length > 0) {
      const fullBreadcrumbs = [
        { name: t('common.home'), url: 'https://oneforall.app/' },
        ...breadcrumbs.map((b) => ({
          name: b.name,
          url: b.url.startsWith('http')
            ? b.url
            : `https://oneforall.app${b.url.startsWith('/') ? '' : '/'}${b.url}`,
        })),
      ]

      const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: fullBreadcrumbs.map((b, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          name: b.name,
          item: b.url,
        })),
      }

      const scriptBreadcrumb = document.createElement('script')
      scriptBreadcrumb.type = 'application/ld+json'
      scriptBreadcrumb.id = 'breadcrumb-jsonld'
      scriptBreadcrumb.text = JSON.stringify(breadcrumbSchema)
      document.head.appendChild(scriptBreadcrumb)
      jsonLdElements.push(scriptBreadcrumb)
    }

    return () => {
      // Dọn dẹp script JSON-LD khi unmount
      jsonLdElements.forEach((el) => el.remove())
    }
  }, [title, description, canonicalUrl, ogType, faqList, breadcrumbs, noindex, alternates])

  return null
}
