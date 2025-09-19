// server/routes/collections.js
import express from 'express';
const router = express.Router();

const SHOP = process.env.SHOP; // e.g. my-store.myshopify.com
const ACCESS_TOKEN = process.env.SHOPIFY_ACCESS_TOKEN;
const API_VERSION = '2025-07'; // use an API version you want

async function shopifyGraphQL(query, variables = {}) {
    const res = await fetch(`https://${SHOP}/admin/api/${API_VERSION}/graphql.json`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Access-Token": ACCESS_TOKEN
        },
        body: JSON.stringify({ query, variables })
    });
    return res.json();
}

const COLLECTIONS_QUERY = `
query fetchCollections($cursor: String) {
  collections(first: 250, after: $cursor) {
    pageInfo { hasNextPage endCursor }
    edges {
      node {
        id
        title
        handle
        metafields(first: 50) {
          edges {
            node {
              id
              namespace
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

router.get('/api/collections-tree', async (req, res) => {
    try {
        let cursor = null;
        const all = [];
        while (true) {
            const payload = await shopifyGraphQL(COLLECTIONS_QUERY, { cursor });
            if (!payload?.data?.collections) throw new Error('Bad response from Shopify');
            const edges = payload.data.collections.edges || [];
            edges.forEach(e => {
                const node = e.node;
                // flatten metafields into key->value
                const meta = {};
                (node.metafields?.edges || []).forEach(m => {
                    const mf = m.node;
                    meta[`${mf.namespace}.${mf.key}`] = mf.value;
                });
                all.push({
                    id: node.id,           // GID, e.g. gid://shopify/Collection/123
                    title: node.title,
                    handle: node.handle,
                    metafields: meta
                });
            });
            if (!payload.data.collections.pageInfo.hasNextPage) break;
            cursor = payload.data.collections.pageInfo.endCursor;
        }

        // Build tree: children arrays
        const byId = {};
        all.forEach(c => byId[c.id] = { ...c, children: [] });

        const roots = [];
        all.forEach(c => {
            // try our chosen metafield key: custom.parent_collection
            const parentValue = c.metafields['custom.parent_handle'] || null;
            if (parentValue && byId[parentValue]) {
                byId[parentValue].children.push(byId[c.id]);
            } else {
                roots.push(byId[c.id]);
            }
        });

        res.json({ tree: roots, total: all.length });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
