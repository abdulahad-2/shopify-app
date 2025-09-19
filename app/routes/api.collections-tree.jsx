import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// GraphQL query
const COLLECTIONS_QUERY = `
  query fetchCollections($cursor: String) {
    collections(first: 250, after: $cursor) {
      pageInfo { hasNextPage endCursor }
      edges {
        node {
          id
          title
          handle
          metafields(first: 10, namespace: "custom") {
            edges {
              node {
                key
                type
                value
              }
            }
          }
        }
      }
    }
  }
`;

export const loader = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  let cursor = null;
  let all = [];

  while (true) {
    const resp = await admin.graphql(COLLECTIONS_QUERY, { variables: { cursor } });
    const data = await resp.json();

    const edges = data.data.collections.edges;
    edges.forEach(({ node }) => {
      const meta = {};
      (node.metafields?.edges || []).forEach(m => {
        meta[`custom.${m.node.key}`] = m.node.value;
      });
      all.push({
        id: node.id,
        title: node.title,
        handle: node.handle,
        metafields: meta,
      });
    });

    if (!data.data.collections.pageInfo.hasNextPage) break;
    cursor = data.data.collections.pageInfo.endCursor;
  }

  // --- FIX START ---
  const byId = {};
  all.forEach(c => {
    const parentHandles = c.metafields["custom.parent_handle"]
      ? c.metafields["custom.parent_handle"]
        .split(",")
        .map(h => h.trim())
        .filter(Boolean)
      : [];

    byId[c.id] = {
      ...c,
      parentHandles,
      children: [],
    };
  });

  const roots = [];

  all.forEach(c => {
    const node = byId[c.id];

    if (node.parentHandles.length > 0) {
      let attached = false;
      node.parentHandles.forEach(ph => {
        const parent = all.find(p => p.handle === ph);
        if (parent) {
          byId[parent.id].children.push(node);
          attached = true;
        }
      });
      if (!attached) {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });
  // --- FIX END ---

  return json({ tree: roots, total: all.length });
};
