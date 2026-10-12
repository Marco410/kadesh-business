import { gql } from "@apollo/client";

/** Novedades de Kadesh Negocios: las de SaaS y las de "Ambas" apps. */
export const SAAS_CHANGELOG_LIST_QUERY = gql`
  query SaasChangelogList($take: Int!, $skip: Int!) {
    systemReleases(
      where: { product: { in: ["saas", "all"] } }
      orderBy: [{ releasedAt: desc }]
      take: $take
      skip: $skip
    ) {
      id
      version
      product
      title
      body
      releasedAt
    }
    systemReleasesCount(where: { product: { in: ["saas", "all"] } })
  }
`;
