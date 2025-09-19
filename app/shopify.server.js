import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

// ✅ Check if app is deployed and HOST is set
const isDeployed = process.env.HOST && !process.env.HOST.includes("example.com");

const shopify = isDeployed
  ? shopifyApp({
      apiKey: process.env.SHOPIFY_API_KEY,
      apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
      apiVersion: ApiVersion.January25,
      scopes: process.env.SCOPES?.split(","),
      appUrl: process.env.HOST, // use HOST env after first deploy
      authPathPrefix: "/auth",
      sessionStorage: new PrismaSessionStorage(prisma),
      distribution: AppDistribution.AppStore,
      future: {
        unstable_newEmbeddedAuthStrategy: true,
        removeRest: true,
      },
      ...(process.env.SHOP_CUSTOM_DOMAIN
        ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
        : {}),
    })
  : null; // Pehle deploy pe null, error nahi aayega

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify?.addDocumentResponseHeaders;
export const authenticate = shopify?.authenticate;
export const unauthenticated = shopify?.unauthenticated;
export const login = shopify?.login;
export const registerWebhooks = shopify?.registerWebhooks;
export const sessionStorage = shopify?.sessionStorage;
