import { gql } from "@apollo/client";

export const SAAS_CHANGELOG_LIST_QUERY = gql`
  query SaasChangelogList($take: Int!, $skip: Int!) {
    systemReleases(
      where: { product: { in: ["saas"] } }
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
    systemReleasesCount(where: { product: { in: ["saas"] } })
  }
`;
